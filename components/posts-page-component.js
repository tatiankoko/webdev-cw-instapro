import {USER_POSTS_PAGE} from "../routes.js";
import {renderHeaderComponent} from "./header-component.js";
import {goToPage, posts} from "../index.js";
/*import {formatDistanceToNow} from 'date-fns';
import ru from 'date-fns/locale/ru';*/

/**
 * Рендер постов из api
 * @param appEl
 */
export function renderPostsPageComponent({ appEl }) {
  console.log("Актуальный список постов:", posts);

    /*const ruLocale = require('date-fns/locale/ru')
  /*
    const eoLocale = require('date-fns/locale/eo')
  const result = formatDistanceToNow(
    new Date(2016, 7, 1),
    {locale: ruLocale}
  )
     */

  const postsHtml = posts
      .map(post => {
        return `
          <li class="post">
            <div class="post-header" data-user-id="${post.user.id}">
                <img class="post-header__user-image" src="${post.user.imageUrl}" class="post-header__user-image" alt="фото ${post.user.name}">
                <p class="post-header__user-name">${post.user.name}</p>
            </div>
          
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
              3 часа назад
            </p>
          </li>`;
      })
      .join('');

  /**
   * @TODO: чтобы отформатировать дату создания поста в виде "19 минут назад"
   * можно использовать https://date-fns.org/v2.29.3/docs/formatDistanceToNow
   */

  appEl.innerHTML = `
              <div class="page-container">
                <div class="header-container"></div>
                <ul class="posts">
                  ${postsHtml}
                </ul>
              </div>`;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  for (let userEl of document.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  }
}
