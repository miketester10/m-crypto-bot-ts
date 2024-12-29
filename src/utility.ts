const mk2Formatter = (text: string): string => {
  const symbols: string[] = [
    "_",
    ">",
    "<",
    "#",
    "+",
    "-",
    "=",
    "|",
    "{",
    "}",
    "(",
    ")",
    "[",
    "]",
    ".",
    "!",
  ];

  for (const symbol of symbols) {
    let index = text.indexOf(symbol);

    while (index !== -1) {
      if (index > 0 && text[index - 1] !== "\\") {
        text = text.slice(0, index) + "\\" + text.slice(index);
      }
      index = text.indexOf(symbol, index + 2);
    }
  }

  return text;
};

export { mk2Formatter };
