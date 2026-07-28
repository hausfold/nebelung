# Catppuccin Latte

evaluate-commands %sh{
    rosewater='rgb:d78d7d'
    flamingo='rgb:d77c7c'
    pink='rgb:e47cc7'
    mauve='rgb:8545e3'
    red='rgb:ca2a40'
    maroon='rgb:de5059'
    peach='rgb:f66d2d'
    yellow='rgb:d99137'
    green='rgb:4a9e3a'
    teal='rgb:2f9197'
    sky='rgb:30a4de'
    sapphire='rgb:379eb1'
    blue='rgb:2a6ae8'
    lavender='rgb:7589f3'
    text='rgb:515151'
    subtext1='rgb:616161'
    subtext0='rgb:717171'
    overlay2='rgb:808080'
    overlay1='rgb:909090'
    overlay0='rgb:a1a1a1'
    surface2='rgb:b0b0b0'
    surface1='rgb:c0c0c0'
    surface0='rgb:d0d0d0'
    base='rgb:f1f1f1'
    mantle='rgb:e9e9e9'
    crust='rgb:e0e0e0'

    echo "
        set-face global title  ${text}+b
        set-face global header ${subtext0}+b
        set-face global bold   ${maroon}+b
        set-face global italic ${maroon}+i
        set-face global mono   ${green}
        set-face global block  ${sapphire}
        set-face global link   ${blue}
        set-face global bullet ${peach}
        set-face global list   ${peach}

        set-face global Default            ${text},${base}
        set-face global PrimarySelection   ${text},${surface2}
        set-face global SecondarySelection ${text},${surface2}
        set-face global PrimaryCursor      ${crust},${rosewater}
        set-face global SecondaryCursor    ${text},${overlay0}
        set-face global PrimaryCursorEol   ${surface2},${lavender}
        set-face global SecondaryCursorEol ${surface2},${overlay1}
        set-face global LineNumbers        ${overlay1},${base}
        set-face global LineNumberCursor   ${rosewater},${surface2}+b
        set-face global LineNumbersWrapped ${rosewater},${surface2}+i
        set-face global MenuForeground     ${text},${surface1}+b
        set-face global MenuBackground     ${text},${surface0}
        set-face global MenuInfo           ${crust},${teal}
        set-face global Information        ${crust},${teal}
        set-face global Error              ${crust},${red}
        set-face global StatusLine         ${text},${mantle}
        set-face global StatusLineMode     ${crust},${yellow}
        set-face global StatusLineInfo     ${crust},${teal}
        set-face global StatusLineValue    ${crust},${yellow}
        set-face global StatusCursor       ${crust},${rosewater}
        set-face global Prompt             ${teal},${base}+b
        set-face global MatchingChar       ${maroon},${base}
        set-face global Whitespace         ${overlay1},${base}+f
        set-face global WrapMarker         Whitespace
        set-face global BufferPadding      ${base},${base}

        set-face global value         ${peach}
        set-face global type          ${blue}
        set-face global variable      ${text}
        set-face global module        ${maroon}
        set-face global function      ${blue}
        set-face global string        ${green}
        set-face global keyword       ${mauve}
        set-face global operator      ${sky}
        set-face global attribute     ${green}
        set-face global comment       ${overlay0}
        set-face global documentation comment
        set-face global meta          ${yellow}
        set-face global builtin       ${red}
    "
}
