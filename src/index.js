import { serviceImagesByInputValue } from './api.js';
import Notiflix from 'notiflix';
import 'notiflix/src/notiflix.css';
import { formToJSON } from 'axios';

selectors = {
  searchForm: document.querySelector('.search-form'),
  galleryContainer: document.querySelector('.gallery'),
  input: document.querySelector('input'),
  guard: document.querySelector('.js-guard'),
};

selectors.searchForm.addEventListener('submit', onSearch);

selectors.input.addEventListener('input', clearGallery);

const options = {
  root: null,
  rootMargin: '200px',
  threshold: 0,
};

let page = 1;

const observer = new IntersectionObserver(onPagination, options);

function onPagination(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      page += 1;
      serviceImagesByInputValue(value, page).then(data => {
        const { hits, total } = data;

        selectors.galleryContainer.insertAdjacentHTML(
          'beforeend',
          createImageMarkup({ hits })
        );
        if (page >= total) {
          observer.unobserve(selectors.guard);
        }
      });
    }
  });
}

function onSearch(evt) {
  evt.preventDefault();

  const { searchQuery } = evt.currentTarget.elements;
  //   console.log(searchQuery.value);
  const inputValue = searchQuery.value.trim();
  if (!inputValue) {
    return Notiflix.Notify.failure('Search field cannot be empty!');
  }

  serviceImagesByInputValue(inputValue, page)
    .then(data => {
      const { hits, total } = data;

      if (!hits.length) {
        throw new Error(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }

      selectors.galleryContainer.insertAdjacentHTML(
        'beforeend',
        createImageMarkup({ hits })
      );

      if (page < total) {
        observer.observe(selectors.guard);
      }
    })
    .catch(error => handleError(error))
    .finally(evt.currentTarget.reset());
}

function createImageMarkup({ hits }) {
  return hits
    .map(
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
  <img src="${webformatURL}" alt="${tags}" loading="lazy" width="300" />
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
    )
    .join('');
}

function handleError(error) {
  Notiflix.Notify.failure(error.message);
}

function clearGallery() {
  selectors.galleryContainer.innerHTML = '';
}
