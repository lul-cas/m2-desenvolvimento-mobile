const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const regexPassword = /^.{8,}$/;
const regexPhone = /^\(\d{2}\) \d{5}-\d{4}$/;
const regexDate = /^\d{2}\/\d{2}\/\d{4}$/;
const regexValue = /^\d+(\.\d{1,2})?$/;
const regexUsername = /^[a-zA-Z0-9_]{3,20}$/;

export {
  regexEmail,
  regexPassword,
  regexPhone,
  regexDate,
  regexValue,
  regexUsername,
};
