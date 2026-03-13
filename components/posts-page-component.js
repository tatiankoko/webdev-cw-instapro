import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { formatDistanceToNow } from "date-fns";
import ru from "date-fns/locale/ru";
import { getPostById } from "../index.js";

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
 * Возвращает количества лайков поста в нужном формате.
 * @param {Object} likes - Список лайков одного поста.
 * @returns {string} - Имя последнего лайкнувшего пользователя и количество лайков поста.
 */
const getLikesText = (likes)=> {
    let likesText = '0';

    if (likes.length > 0) {
        const like = likes.at(-1);
        likesText = like.name;

        if (likes.length > 1) {
            likesText += ' и еще ' + (String) (likes.length - 1);
        }
    }

    return likesText;
}

/**
 * Рендер постов из api
 *
 * @param {Object} user - Объект пользователя, содержащий данные о текущем авторизованном пользователе (если он есть).
 * @param {HTMLElement} appEl - Корневой элемент приложения, в который будет рендериться страница.
 * @param {boolean} isUserPostsPage - Если true, то будет верстка страницы постов конкретного пользователя;
 *                                     если false, то главной страницы со всеми постами всех пользователей.
 * @param {Object[]} posts - Список объектов постов
 * @param {Function} goToPage - Функция для навигации по страницам.
 * @param {Function} onLike - Функция, вызываемая при нажатии на иконку лайка.
 * @param {Function} onDelete - Функция, вызываемая при нажатии на кнопку удаления поста. Актуально только для страницы
 *                              постов зарегистрированного пользователя.
 */
export function renderPostsPageComponent({
                                             user,
                                             appEl,
                                             isUserPostsPage,
                                             posts,
                                             goToPage,
                                             onLike,
                                             onDelete }) {
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
                 isUserPostsPage && user && post.user.id === user._id
                   ? `
                        <div class="posts-user-header__menu" data-post-id="${post.id}">
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
              
              <p class="post-likes-text" data-post-id="${post.id}">
                Нравится: <strong>${getLikesText(post.likes)}</strong>
              </p>
              
              <ul class="post-likes-list" tabindex="0">
              </ul>                      
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
      user,
      element: document.querySelector(".header-container"),
      goToPage,
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

  // Обработка клика на лайк.
  // Доступно только для авторизованного пользователя
  for (let likeButtonEl of document.querySelectorAll(".like-button")) {
      if (user) {
          likeButtonEl.addEventListener("click", () => {
              likeButtonEl.classList.add('like-button__loading');
              likeButtonEl.disabled = true;
              onLike(likeButtonEl.dataset.postId);
          });
      } else {
          likeButtonEl.disabled = true;
          likeButtonEl.style.cursor = "auto";
      }
  }

  /*
   * Рендер списка лайкнувших пользователей.
   */
  const getLikesListHtml = (likes)=> {
      const listHtml = likes.map((like) => {
          /*
          Нюанс апи - если запрошен список постов конкретного пользователя,
          то возвращается список лайков с полем _id и полной информацией
          об аккаунтах лайкнувших пользователей
           */
          const userId = like.id ? like.id : like._id;

          return `
           <li class="post-likes-list-item" data-user-id="${userId}">
              ${
              like.id
                  ? `<img src="../assets/images/like-active.svg" alt="сердечко лайка">`
                  : `<img src=${like.imageUrl} alt="фото пользователя" class="post-likes-list-item__image">`
              }
              <p>${like.name}</p>                                                  
           </li>`
      }).join("");

      if (listHtml !== "") {
          return listHtml;
      } else {
          return `<p>Никто еще не поставил лайк</p>`
      }
  }

  /*
  Обработка клика на количество лайкнувших пост пользователей
   */
  for (let likeTextEl of
      document.querySelectorAll(".post-likes-text")) {
      likeTextEl.addEventListener("click", () => {
          const postLikesListEl = likeTextEl.nextElementSibling;

          if (postLikesListEl) {
              const post = getPostById(likeTextEl.dataset.postId);

              if (post) {
                  postLikesListEl.style.display = "flex";

                  // Рендер списка лайкнувших пользователей.
                  postLikesListEl.innerHTML = getLikesListHtml(post.likes)

                  // При клике на имя лайкнувшего пользователя переходим на страницу постов этого пользователя
                  for (let likesListItemEl of document.querySelectorAll(".post-likes-list-item")) {
                      likesListItemEl.addEventListener("click", (event) => {
                          event.stopPropagation();

                          goToPage(USER_POSTS_PAGE, {
                              userId: likesListItemEl.dataset.userId,
                          });
                      })
                  }

                  // Фокус, чтобы сработал blur
                  postLikesListEl.focus();
              }
          }
      })
  }

  /*
  Убираем список лайкнувших пользователей при потере фокуса
   */
  for (let postLikesListEl of
      document.querySelectorAll(".post-likes-list")) {
      postLikesListEl.addEventListener("blur", () => {
          postLikesListEl.style.display = "none";
      })
  }

  /*
  Рендер меню поста (три точки в правом верхнем углу)
   */
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

      menuDeleteEl.addEventListener("click", () => {
          menuDeleteEl.disabled = true;
          onDelete(menuEl.dataset.postId);
          menuDeleteEl.disabled = false;
      });
  }
}
