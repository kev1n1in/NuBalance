import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
*{
    /* outline:1px solid black */
}

  body, h1, h2, h3, h4, h5, h6, p, figure, blockquote, dl, dd {
    margin: 0;
    padding: 0;

  }
  body {
  scrollbar-gutter: stable; /* 保持滾動條寬度，避免布局變化 */
}


  ul[role="list"], ol[role="list"] {
    list-style: none;
  }

  body, input, button, select, option {
    font-family: sans-serif;
    font-size: 1rem;
    line-height: 1.5;
  }

  article, aside, figcaption, figure, footer, header, hgroup, main, nav, section {
    display: block;
  }


  img, iframe {
    border-style: none;
  }

  input:-webkit-autofill,
  input:-webkit-autofill:hover, 
  input:-webkit-autofill:focus, 
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px white inset !important;
  }


  button {
    background: none;
    color: inherit;
    border: none;
    padding: 0;
    font: inherit;
    cursor: pointer;
  }


  a {
    text-decoration: none;
    color: inherit;
  }


  *, *::before, *::after {
    box-sizing: border-box;
  }

  [tabindex="-1"]:focus:not(:focus-visible) {
    outline: none;
  }
  ::-webkit-scrollbar {
    width: 12px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 6px;
    border: 3px solid transparent;
    background-clip: content-box;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }

  ::-webkit-scrollbar-track {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
  }
`;
