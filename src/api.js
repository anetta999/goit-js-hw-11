import axios from 'axios';
axios.defaults.baseURL = 'https://pixabay.com/api/';

async function serviceImagesByInputValue(value) {
  const params = new URLSearchParams({
    key: '38324496-84226fc1fa5e9d21681883b31',
    q: value,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  });
  const { data } = await axios(`?${params}`);
  return data;
}

export { serviceImagesByInputValue };
