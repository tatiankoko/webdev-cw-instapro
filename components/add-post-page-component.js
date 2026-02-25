import {renderUploadImageComponent} from "./upload-image-component.js";
import {renderHeaderComponent} from "./header-component.js";
/**
 * Рендер страницы добавления поста
 * Этот компонент предоставляет пользователю интерфейс добавления нового поста.
 * @param {HTMLElement} appEl - Корневой элемент приложения, в который будет рендериться страница.
 * @param {Function} onAddPostClick - Функция, вызываемая при нажатии на кнопку добавления поста.
 */
export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  const render = () => {
    appEl.innerHTML = `
      <div class="page-container">
        <div class="header-container"></div>
        <div class="upload-image-container"></div>
        <textarea type="textarea" placeholder="Добавьте подпись..." rows="4"
          id="text-input"></textarea>
        <button class="button" id="add-button">Добавить</button>
      </div>
    `;

    // Рендерим заголовок страницы
    renderHeaderComponent({
      element: document.querySelector(".header-container"),
    });

    const headerButton = appEl.querySelector(".header-button");
    // Скрываем отображение кнопки добавления поста
    headerButton.style.opacity = "0";

    /**
     * URL изображения, загруженного пользователем.
     * @type {string}
     */
    let imageUrl = "";

    // Рендерим компонент загрузки изображения
    const uploadImageContainer = appEl.querySelector(".upload-image-container");

    if (uploadImageContainer) {
      renderUploadImageComponent({
        element: uploadImageContainer,
        onImageUrlChange(newImageUrl) {
          imageUrl = newImageUrl;
        },
      });
    }

    document.getElementById("add-button").addEventListener("click", () => {
      if (!imageUrl) {
        alert("Не выбрана фотография");
        return;
      }

      const textInputEl = document.getElementById("text-input");

      if (!textInputEl) {
        alert("Добавьте подпись!");
        return;
      }

      onAddPostClick({
        description: textInputEl.value,
        imageUrl: imageUrl,
      });
    });
  };

  render();
}
