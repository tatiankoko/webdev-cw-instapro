import {USER_POSTS_PAGE} from "../routes.js";
import {renderHeaderComponent} from "./header-component.js";
import {goToPage, posts} from "../index.js";
import {formatDistanceToNow} from 'date-fns';
import ru from 'date-fns/locale/ru';

/**
 * Рендер постов из api
 * @param {HTMLElement} appEl - корневой элемент приложения, в который будет рендериться страница.
 * @param {boolean} isUserPostsPage - если true, то будет верстка страницы постов конкретного пользователя;
 *                                     если false, то главной страницы со всеми постами всех пользователей.
 * @param {Function} onLike - функция, вызываемая при нажатии на иконку лайка.
 */
export function renderPostsPageComponent({ appEl, isUserPostsPage, onLike }) {
  console.log("Актуальный список постов:", posts);

  // Рендер информации о пользователе
  const postHeaderHtml = (user)=> {
      if (user === undefined) {
          return ""
      } else {
          return `
           <div class="${isUserPostsPage ? 'posts-user-header' : 'post-header'}" data-user-id="${user.id}">
               <img 
                    class="${isUserPostsPage ? 'posts-user-header__user-image' : 'post-header__user-image'}" 
                    src="${user.imageUrl}" 
                    alt="фото ${user.name}">
               <p class="${isUserPostsPage ? 'posts-user-header__user-name' : 'post-header__user-name'}">
                    ${user.name}
               </p>
           </div>
          `
      }
  }

  const postsHtml = posts
      .map(post => {
        return `
          <li class="post">            
            ${
                !isUserPostsPage
                ? postHeaderHtml(post.user)
                : ""
            }            
            
            <div class="post-image-container">
              <img class="post-image" src="${post.imageUrl}" alt="${post.description}">
            </div>
            
            <div class="post-likes">
              <button data-post-id="${post.id}" class="like-button">
                <img src="./assets/images/${post.isLiked ? 'like-active.svg' : 'like-not-active.svg'}" alt="сердечко лайка">
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
              ${formatDistanceToNow(
                post.createdAt,
                {
                  addSuffix: true,
                  includeSeconds: true,
                  locale: ru
                }
            )}
            </p>
          </li>`;
      })
      .join('');

  const currentUser = isUserPostsPage
      ? posts.at(0).user
      : null;

  appEl.innerHTML = `
              <div class="page-container">
                <div class="header-container"></div>
                ${
                  isUserPostsPage
                  ? postHeaderHtml(currentUser)
                  : ""
                }           
                <ul class="posts">
                  ${postsHtml}
                </ul>
              </div>`;

  renderHeaderComponent({
      element: document.querySelector(".header-container"),
      userId: currentUser ? currentUser.id: '',
  });

  // Обработка клика на автора поста только для страницы с постами всех пользователей
  if (!isUserPostsPage) {
      for (let userEl of document.querySelectorAll(".post-header")) {
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
          onLike(likeButtonEl.dataset.postId)
      });
  }
}
