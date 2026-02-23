import {renderUploadImageComponent} from "./upload-image-component.js";

export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  const render = () => {
    // @TODO: Реализовать страницу добавления поста
    const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>
        Cтраница добавления поста
        <div class="upload-image-container"></div>
        <textarea type="textarea" placeholder="Добавьте подпись..." rows="4"
          id="text-input"></textarea>
        <button class="button" id="add-button">Добавить</button>
      </div>
    `;

    appEl.innerHTML = appHtml;

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
