# Catppuccin Mocha

evaluate-commands %sh{
    rosewater='rgb:f3e1dd'
    flamingo='rgb:efcece'
    pink='rgb:f2c4e5'
    mauve='rgb:c9a8f1'
    red='rgb:ed8fa9'
    maroon='rgb:e6a3ad'
    peach='rgb:f5b58e'
    yellow='rgb:f7e2b5'
    green='rgb:abe1a6'
    teal='rgb:9be0d5'
    sky='rgb:91dbe8'
    sapphire='rgb:7dc6e7'
    blue='rgb:8db4f3'
    lavender='rgb:b5bff8'
    text='rgb:d7d7d7'
    subtext1='rgb:c3c3c3'
    subtext0='rgb:aeaeae'
    overlay2='rgb:9a9a9a'
    overlay1='rgb:858585'
    overlay0='rgb:717171'
    surface2='rgb:5c5c5c'
    surface1='rgb:494949'
    surface0='rgb:343434'
    base='rgb:202020'
    mantle='rgb:191919'
    crust='rgb:121212'

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
        set-face global LineNumbersWrapped ${rosewater},${surface2}
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
