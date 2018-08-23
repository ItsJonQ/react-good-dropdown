import styled from './styled'

export const DropdownUI = styled('div')`
box-sizing: border-box;

* {
  box-sizing: border-box;
}
`

export const MenuUI = styled('div')`
background-clip: padding-box;
background-color: #fff;
border-radius: .25rem;
border: 1px solid rgba(0,0,0,.15);
box-sizing: border-box;
color: #212529;
font-size: 1rem;
list-style: none;
margin: .125rem 0 0;
max-height: 200px;
max-width: 200px;
min-width: 10rem;
overflow-y: auto;
padding: .5rem 0;
text-align: left;
z-index: 1000;

* {
  box-sizing: border-box;
}

&.is-subMenu {
  position: relative;
  top: -11px;
}
`

export const ItemUI = styled('div')`
background-color: transparent;
border: 0;
clear: both;
color: #212529;
display: block;
font-weight: 400;
padding: .25rem 1.5rem;
position: relative;
text-align: inherit;
white-space: nowrap;
width: 100%;

&.is-hover {
  background-color: #f8f9fa;
  color: #16181b;
  text-decoration: none;
}

${props => props.isHover ? `
  background-color: #f8f9fa;
  color: #16181b;
  text-decoration: none;
` : null}

${props => props.isActive ? `
  background-color: dodgerblue;
  color: white;
  text-decoration: none;
` : null}

`
export const ItemLinkUI = styled('div')`
  display: block;
`