export const capitalize = (text) => {
  return text.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
};