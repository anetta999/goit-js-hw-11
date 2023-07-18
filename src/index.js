import { serviceImagesByInputValue } from './api.js';
import Notiflix from 'notiflix';
import 'notiflix/src/notiflix.css';
import { formToJSON } from 'axios';

const searchForm = document.querySelector('.search-form');
const galleryContainer = document.querySelector('.gallery');

searchForm.addEventListener('submit', onSearch);

async function onSearch(evt) {
  evt.preventDefault();

  const { searchQuery } = evt.currentTarget.elements;
  //   console.log(searchQuery.value);
  const inputValue = searchQuery.value.trim();
  if (!inputValue) {
    return Notiflix.Notify.failure('Search field cannot be empty!');
  }

  try {
    const { hits } = await serviceImagesByInputValue(inputValue);

    // if (!{ hits }.length) {
    //   throw new Error(
    //     'Sorry, there are no images matching your search query. Please try again.'
    //   );
    // }

    galleryContainer.innerHTML = createImageMarkup({ hits });
  } catch (error) {
    handleError(error);
  }
}

function createImageMarkup({ hits }) {
  return hits.map(
    ({
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    }) => {
      return `<div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      ${likes}
    </p>
    <p class="info-item">
      <b>Views</b>
      ${views}
    </p>
    <p class="info-item">
      <b>Comments</b>
      ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>
      ${downloads}
    </p>
  </div>
</div>`;
    }
  );
}

function handleError(error) {
  Notiflix.Notify.failure(error.message);
}
