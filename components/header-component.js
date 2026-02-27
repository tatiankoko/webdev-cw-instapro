import { goToPage, logout, user } from "../index.js";
import {ADD_POSTS_PAGE, AUTH_PAGE, POSTS_PAGE, USER_POSTS_PAGE} from "../routes.js";

/**
 * Компонент заголовка страницы.
 * Этот компонент отображает шапку страницы с логотипом, кнопкой добавления постов/входа и кнопкой выхода (если пользователь авторизован).
 * 
 * @param {HTMLElement} params.element - HTML-элемент, в который будет рендериться заголовок.
 * @param {String} params.userId - если отображается страница с постами конкретного юзера, то id этого пользователя.
 * @returns {HTMLElement} Возвращает элемент заголовка после рендеринга.
 */
export function renderHeaderComponent({ element, userId = '' }) {
  /**
   * Рендерит содержимое заголовка.
   */
  element.innerHTML = `
  <div class="page-header">
      <h1 class="logo">instapro</h1>
      <button class="header-button add-or-login-button">
      ${
        user
          ? `<div title="Добавить пост" class="add-post-sign"></div>`
          : "Войти"
      }
      </button>
      ${
        user 
            ? `<button title="${user.name}" class="header-button logout-button">
                ${
                    user._id === userId
                    ? `Выйти`
                    : `<img 
                            class="post-header__user-image" 
                            src="${user.imageUrl}" 
                            alt="фото ${user.name}">`            
                }
                </button>`
            : ""
      }  
  </div>
  `;

  const addOrLoginButtonEl = element.querySelector(".add-or-login-button");

  /**
   * Обработчик клика по кнопке "Добавить пост"/"Войти".
   * Если пользователь авторизован, перенаправляет на страницу добавления постов.
   * Если пользователь не авторизован, перенаправляет на страницу авторизации.
   */

  addOrLoginButtonEl
    .addEventListener("click", () => {
      if (user) {
        goToPage(ADD_POSTS_PAGE);
      } else {
        goToPage(AUTH_PAGE);
      }
    });

  // Скрываем отображение кнопки добавления поста для страницы с постами конкретного юзера
  if (userId !== '') {
      addOrLoginButtonEl.style.display = "none";
  }

  /**
   * Обработчик клика по логотипу.
   * Перенаправляет на страницу с постами.
   */
  element.querySelector(".logo").addEventListener("click", () => {
    goToPage(POSTS_PAGE);
  });

  /**
   * Обработчик клика по кнопке "Выйти".
   * Если кнопка существует (т.е. пользователь авторизован) и мы находимся на странице постов этого пользователя, вызывает функцию `logout`.
   * На странице других постов, вызывает функцию `goToPage`, перенаправляя на страницу с постами авторизованного пользователя
   */
  element.querySelector(".logout-button")?.addEventListener("click", ()=> {
      if (user && user._id === userId) {
          logout();
      } else {
          console.log("userId: " + user._id);
          goToPage(USER_POSTS_PAGE,{
              userId: user._id,
          });
      }
  });

  return element;
}
