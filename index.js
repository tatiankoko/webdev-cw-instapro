import {addPost, deletePost, dislike, getPosts, getUserPosts, like} from "./api.js";
import {renderAddPostPageComponent} from "./components/add-post-page-component.js";
import {renderAuthPageComponent} from "./components/auth-page-component.js";
import {ADD_POSTS_PAGE, AUTH_PAGE, LOADING_PAGE, POSTS_PAGE, USER_POSTS_PAGE,} from "./routes.js";
import {renderPostsPageComponent} from "./components/posts-page-component.js";
import {renderLoadingPageComponent} from "./components/loading-page-component.js";
import {getUserFromLocalStorage, removeUserFromLocalStorage, saveUserToLocalStorage,} from "./helpers.js";

let user = getUserFromLocalStorage();
let page = null;
let posts = [];

const getToken = () => {
  return user ? `Bearer ${user.token}` : undefined;
};

export const logout = () => {
  user = null;
  removeUserFromLocalStorage();
  goToPage(POSTS_PAGE);
};

/**
 * Возвращает пост с заданным id из списка постов.
 * @param {string} id - Id требуемого поста.
 * @returns {Object} - Объект поста, если пост с заданным id существует, иначе undefined.
 */
export const getPostById = (id) => {
    return posts.find((post) => post.id === id);
}

/**
 * Включает страницу приложения
 */
const goToPage = (newPage, data) => {
  if (
    [
      POSTS_PAGE,
      AUTH_PAGE,
      ADD_POSTS_PAGE,
      USER_POSTS_PAGE,
      LOADING_PAGE,
    ].includes(newPage)
  ) {
    if (newPage === ADD_POSTS_PAGE) {
      /* Если пользователь не авторизован, то отправляем его на страницу авторизации перед добавлением поста */
      page = user ? ADD_POSTS_PAGE : AUTH_PAGE;
      return renderApp();
    }

    if (newPage === POSTS_PAGE) {
      page = LOADING_PAGE;
      renderApp();

      return getPosts({ token: getToken() })
        .then((newPosts) => {
          page = POSTS_PAGE;
          posts = newPosts;
          renderApp();
        })
        .catch((error) => {
          console.error(error);
          goToPage(POSTS_PAGE);
        });
    }

    if (newPage === USER_POSTS_PAGE) {
      page = LOADING_PAGE;
      renderApp();

      posts = getUserPosts(
          { token: getToken(), id: data.userId })
          .then((newPosts) => {
            page = USER_POSTS_PAGE;
            posts = newPosts;
            renderApp();
          })
          .catch((error) => {
            console.error(error);
            goToPage(POSTS_PAGE);
          });

      return renderApp();
    }

    page = newPage;
    renderApp();

    return;
  }

  throw new Error("страницы не существует");
};

const renderApp = () => {
  const appEl = document.getElementById("app");
  if (page === LOADING_PAGE) {
    return renderLoadingPageComponent({
      appEl,
      user,
      goToPage,
    });
  }

  if (page === AUTH_PAGE) {
    return renderAuthPageComponent({
      appEl,
      setUser: (newUser) => {
        user = newUser;
        saveUserToLocalStorage(user);
        goToPage(POSTS_PAGE);
      },
      user,
      goToPage,
    });
  }

  if (page === ADD_POSTS_PAGE) {
    return renderAddPostPageComponent({
      user,
      appEl,
      goToPage,
      onAddPostClick({ description, imageUrl }) {
        addPost({
          token: getToken(),
          description,
          imageUrl
        })
            .catch((error) => {
              console.error(error);
              //goToPage(POSTS_PAGE);
            })
            .finally(()=> {
              goToPage(POSTS_PAGE);
            });
      },
    });
  }

  if (page === POSTS_PAGE) {
    return renderPostsPageComponent({
        user,
        appEl,
        isUserPostsPage : false,
        posts,
        goToPage,
        onLike
    });
  }

  if (page === USER_POSTS_PAGE) {
    return renderPostsPageComponent({
        user,
        appEl,
        isUserPostsPage : true,
        posts,
        goToPage,
        onLike,
        onDelete(postId) {
            deletePost({
                token: getToken(),
                id: postId,
            })
                .then(() => {
                    const post = getPostById(postId);

                    if (post !== undefined) {
                        posts.splice(posts.indexOf(post), 1);
                    }
                })
                .catch((error) => console.error(error))
                .finally(()=> renderApp());
            },
    });
  }
};

/**
 * Ставит/убирает лайк.
 * Отправляет запрос поставить лайк, если лайка не было.
 * Отправляет запрос снять лайк, если лайк уже стоял.
 * @param postId - id поста
 */
const onLike = (postId) => {
  const post = getPostById(postId);

  if (post === undefined)
    return;

  (post.isLiked
          ? dislike({
            token: getToken(),
            id: post.id,
          })
          : like({
            token: getToken(),
            id: post.id,
          }))
      .then(likedPost => {
        post.likes = likedPost.post.likes;
        post.isLiked = likedPost.post.isLiked;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(()=> renderApp())
}

goToPage(POSTS_PAGE);
