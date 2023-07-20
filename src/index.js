import { serviceImagesByInputValue } from './api.js';
import Notiflix from 'notiflix';
import 'notiflix/src/notiflix.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { formToJSON } from 'axios';

const selectors = {
  searchForm: document.querySelector('.search-form'),
  galleryContainer: document.querySelector('.gallery'),
  input: document.querySelector('input'),
  guard: document.querySelector('.js-guard'),
};

let gallerySimplelightbox = new SimpleLightbox('.photo-card a', {
  captionsData: 'alt',
  captionDelay: 250,
});

selectors.searchForm.addEventListener('submit', onSearch);

selectors.input.addEventListener('change', clearGallery);

const options = {
  root: null,
  rootMargin: '200px',
  threshold: 0,
};

let page = 1;
let inputValue = selectors.input.value.trim();

const observer = new IntersectionObserver(onPagination, options);

function onPagination(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      page += 1;

      serviceImagesByInputValue(inputValue, page)
        .then(data => {
          const { hits, totalHits } = data;

          const totalPages = Math.ceil(totalHits / 40);

          selectors.galleryContainer.insertAdjacentHTML(
            'beforeend',
            createImageMarkup({ hits })
          );

          if (page >= totalPages) {
            observer.unobserve(selectors.guard);

            Notiflix.Notify.info(
              "We're sorry, but you've reached the last page of search results."
            );
          }
        })
        .catch(error => handleError(error));
    }
  });
}

function onSearch(evt) {
  evt.preventDefault();

  inputValue = selectors.input.value.trim();

  if (!inputValue) {
    return Notiflix.Notify.failure('Search field cannot be empty!');
  }

  serviceImagesByInputValue(inputValue, page)
    .then(data => {
      const { hits, totalHits } = data;

      const totalPages = Math.ceil(totalHits / 40);

      if (!hits.length) {
        throw new Error(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }

      selectors.galleryContainer.insertAdjacentHTML(
        'beforeend',
        createImageMarkup({ hits })
      );

      if (page < totalPages) {
        observer.observe(selectors.guard);

        Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
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
  <a href="${largeImageURL}">
      <img class="photo-img" src="${webformatURL}" alt="${tags}" loading="lazy" width="300"
    /></a>
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
  page = 1;
}
