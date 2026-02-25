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
 */
export function renderPostsPageComponent({ appEl, isUserPostsPage }) {
  console.log("Актуальный список постов:", posts);

  const postHeaderHtml = (post)=> {
      if (post === undefined) {
          return ""
      } else {
          return `
           <div class="${isUserPostsPage ? 'posts-user-header' : 'post-header'}" data-user-id="${post.user.id}">
               <img 
                    class="${isUserPostsPage ? 'posts-user-header__user-image' : 'post-header__user-image'}" 
                    src="${post.user.imageUrl}" 
                    alt="фото ${post.user.name}">
               <p class="${isUserPostsPage ? 'posts-user-header__user-name' : 'post-header__user-name'}">
                    ${post.user.name}
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
                ? postHeaderHtml(post)
                : ""
            }            
            
            <div class="post-image-container">
              <img class="post-image" src="${post.imageUrl}" alt="${post.description}">
            </div>
            
            <div class="post-likes">
              <button data-post-id="${post.id}" class="like-button">
                <img src="./assets/images/like-not-active.svg" alt="сердечко лайка">
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

  appEl.innerHTML = `
              <div class="page-container">
                <div class="header-container"></div>
                ${
                  isUserPostsPage
                  ? postHeaderHtml(posts.at(0))
                  : ""
                }           
                <ul class="posts">
                  ${postsHtml}
                </ul>
              </div>`;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  if (isUserPostsPage) {
      const headerButton = appEl.querySelector(".header-button");
      // Скрываем отображение кнопки добавления поста
      headerButton.style.opacity = "0";
  }

  if (!isUserPostsPage) {
      for (let userEl of document.querySelectorAll(".post-header")) {
          userEl.addEventListener("click", () => {
              goToPage(USER_POSTS_PAGE, {
                  userId: userEl.dataset.userId,
              });
          });
      }
  }
}
