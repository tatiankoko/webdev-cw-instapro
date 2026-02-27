import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { goToPage, posts, user } from "../index.js";
import { formatDistanceToNow } from "date-fns";
import ru from "date-fns/locale/ru";

/**
 * Функция для правильного выбора окончания слова 'публикация' в зависимости от цифры перед словом.
 * @param postsNumber - количество постов
 * @returns {string} - слово 'публикация' с подходящим окончанием
 */
const getPostWord = (postsNumber)=> {
  if (postsNumber % 10 === 1 && postsNumber % 100 !== 11)
      return "публикация";

  if (
    [2, 3, 4].includes(postsNumber % 10) &&
    ![12, 13, 14].includes(postsNumber % 100)
  )
    return "публикации";

  return "публикаций";
}

/**
 * Рендер постов из api
 * @param {HTMLElement} appEl - корневой элемент приложения, в который будет рендериться страница.
 * @param {boolean} isUserPostsPage - если true, то будет верстка страницы постов конкретного пользователя;
 *                                     если false, то главной страницы со всеми постами всех пользователей.
 * @param {Function} onLike - функция, вызываемая при нажатии на иконку лайка.
 */
export function renderPostsPageComponent({ appEl, isUserPostsPage, onLike }) {
  console.log("Актуальный список постов:", posts);

  const postsHtml = posts
    .map((post) => {
      return `
          <li class="post">            
            <div class="post-header" data-user-id="${post.user.id}">
               <div class="post-header__user-info">
                   <img 
                        class="post-header__user-image" 
                        src="${post.user.imageUrl}" 
                        alt="фото ${post.user.name}">
                   <p class="post-header__user-name">
                        ${post.user.name}
                   </p>
               </div>
               ${
                 isUserPostsPage && post.user.id === user._id
                   ? `
                        <div class="posts-user-header__menu">
                            <div class="posts-user-header__menu-sign"></div>
                            <button class="posts-user-header__menu-delete">Удалить</button>
                        </div>`
                   : ""
               }
            </div>          
            
            <div class="post-image-container">
              <img class="post-image" src="${post.imageUrl}" alt="${post.description}">
            </div>
            
            <div class="post-likes">
              <button data-post-id="${post.id}" class="like-button">
                <img src="./assets/images/${post.isLiked ? "like-active.svg" : "like-not-active.svg"}" alt="сердечко лайка">
              </button>
              
              <p class="post-likes-text">
                Нравится: <strong>${post.likes.length}</strong>
              </p>
            </div>
            
            <p class="post-text">
              <span class="user-name">${post.user.name}</span>
              ${post.description}
            </p>
            
            <p class="post-date">
              ${formatDistanceToNow(post.createdAt, {
                addSuffix: true,
                includeSeconds: true,
                locale: ru,
              })}
            </p>
          </li>`;
    })
    .join("");

  // Рендер информации о пользователе
  const postHeaderHtml = (user) => {
    if (user === undefined) {
      return "";
    } else {
      return `
           <div class="posts-user-header" data-user-id="${user.id}">
               <img 
                    class="posts-user-header__user-image" 
                    src="${user.imageUrl}" 
                    alt="фото ${user.name}">
                    
               <div class="posts-user-header__user-info">   
                    <p class="posts-user-header__user-name">
                        ${user.name}
                    </p>
                   
                    <p class="post-header__user-name">
                        ${posts.length} ${getPostWord(posts.length)}
                    </p>
               </div>
           </div>
          `;
    }
  };

  const currentUser = isUserPostsPage ? posts.at(0).user : null;

  appEl.innerHTML = `
              <div class="page-container">
                <div class="header-container"></div>
                ${isUserPostsPage ? postHeaderHtml(currentUser) : ""}           
                <ul class="posts">
                  ${postsHtml}
                </ul>
              </div>`;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
    userId: currentUser ? currentUser.id : "",
  });

  // Обработка клика на автора поста только для страницы с постами всех пользователей
  if (!isUserPostsPage) {
    for (let userEl of document.querySelectorAll(".post-header")) {
      userEl.style.cursor = "pointer";

      userEl.addEventListener("click", () => {
        goToPage(USER_POSTS_PAGE, {
          userId: userEl.dataset.userId,
        });
      });
    }
  }

  // Обработка клика на лайк
  for (let likeButtonEl of document.querySelectorAll(".like-button")) {
    likeButtonEl.addEventListener("click", () => {
      onLike(likeButtonEl.dataset.postId);
    });
  }

  for (let menuEl of document.querySelectorAll(".posts-user-header__menu")) {
    const menuSignEl = menuEl.children[0];
    const menuDeleteEl = menuEl.children[1];

      menuSignEl.addEventListener("click", () => {
          menuDeleteEl.style.display = "block";
          menuDeleteEl.focus();
      });

      menuDeleteEl.addEventListener("blur", () => {
          menuDeleteEl.style.display = "none";
      });
  }
}
