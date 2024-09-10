export const productsSizeDefault = () => {
  const size_number = [];
  for (let i = 1; i <= 60; i++) {
    size_number.push(i);
  }

  return {
    number: size_number,
    letter: ["S", "M", "L", "XL", "XXL", "XXXL", "N/A"],
  };
};
