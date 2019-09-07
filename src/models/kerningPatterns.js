export default [
  { segments: ["[A-Z]", "[A-Z]"] },
  { segments: ["[A-Z]", "[a-z]"] },
  { segments: ["[a-z]", "[a-z]"] },
  { segments: ["[0-9]", "[0-9]"] },
  { segments: ["[.,\\-/]", "[0-9]"] },
  { segments: ["@()[]{}", "[0-9]"] },
  { segments: ["[.,-]", "[A-Za-z]"] },
  { segments: ["@()[]{}", "[A-Za-z]"] },
  { segments: ["[,._]", "[FPTVWfrvw]"] },
  { segments: ["[A-Z]", "[bhklmnprstv]", "[aeiouy]"], isVisible: false },
  { segments: ["@()[]{}", "[A-Z]", "[a-z]"], isVisible: false },
];
