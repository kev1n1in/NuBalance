import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
*{
    font-family: "KG Second Chances", sans-serif;
}

  body, h1, h2, h3, h4, h5, h6, p, figure, blockquote, dl, dd {
    margin: 0;
    padding: 0;

  }
body::-webkit-scrollbar {
  display: none;
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
 
  @font-face {
  font-family: 'KG Second Chances';
  src: url('/fonts/KGSecondChancesSketch.woff') format('woff');
  font-weight: normal;
  font-style: normal;
}


`;
