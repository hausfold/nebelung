# Catppuccin Latte Theme (for zsh-syntax-highlighting)
#
# Paste this files contents inside your ~/.zshrc before you activate zsh-syntax-highlighting
ZSH_HIGHLIGHT_HIGHLIGHTERS=(main cursor)
typeset -gA ZSH_HIGHLIGHT_STYLES

# Main highlighter styling: https://github.com/zsh-users/zsh-syntax-highlighting/blob/master/docs/highlighters/main.md
#
## General
### Diffs
### Markup
## Classes
## Comments
ZSH_HIGHLIGHT_STYLES[comment]='fg=#b4b4b4'
## Constants
## Entitites
## Functions/methods
ZSH_HIGHLIGHT_STYLES[alias]='fg=#4a9e3a'
ZSH_HIGHLIGHT_STYLES[suffix-alias]='fg=#4a9e3a'
ZSH_HIGHLIGHT_STYLES[global-alias]='fg=#4a9e3a'
ZSH_HIGHLIGHT_STYLES[function]='fg=#4a9e3a'
ZSH_HIGHLIGHT_STYLES[command]='fg=#4a9e3a'
ZSH_HIGHLIGHT_STYLES[precommand]='fg=#4a9e3a,italic'
ZSH_HIGHLIGHT_STYLES[autodirectory]='fg=#f66d2d,italic'
ZSH_HIGHLIGHT_STYLES[single-hyphen-option]='fg=#f66d2d'
ZSH_HIGHLIGHT_STYLES[double-hyphen-option]='fg=#f66d2d'
ZSH_HIGHLIGHT_STYLES[back-quoted-argument]='fg=#8545e3'
## Keywords
## Built ins
ZSH_HIGHLIGHT_STYLES[builtin]='fg=#4a9e3a'
ZSH_HIGHLIGHT_STYLES[reserved-word]='fg=#4a9e3a'
ZSH_HIGHLIGHT_STYLES[hashed-command]='fg=#4a9e3a'
## Punctuation
ZSH_HIGHLIGHT_STYLES[commandseparator]='fg=#ca2a40'
ZSH_HIGHLIGHT_STYLES[command-substitution-delimiter]='fg=#434343'
ZSH_HIGHLIGHT_STYLES[command-substitution-delimiter-unquoted]='fg=#434343'
ZSH_HIGHLIGHT_STYLES[process-substitution-delimiter]='fg=#434343'
ZSH_HIGHLIGHT_STYLES[back-quoted-argument-delimiter]='fg=#ca2a40'
ZSH_HIGHLIGHT_STYLES[back-double-quoted-argument]='fg=#ca2a40'
ZSH_HIGHLIGHT_STYLES[back-dollar-quoted-argument]='fg=#ca2a40'
## Serializable / Configuration Languages
## Storage
## Strings
ZSH_HIGHLIGHT_STYLES[command-substitution-quoted]='fg=#d99137'
ZSH_HIGHLIGHT_STYLES[command-substitution-delimiter-quoted]='fg=#d99137'
ZSH_HIGHLIGHT_STYLES[single-quoted-argument]='fg=#d99137'
ZSH_HIGHLIGHT_STYLES[single-quoted-argument-unclosed]='fg=#de5059'
ZSH_HIGHLIGHT_STYLES[double-quoted-argument]='fg=#d99137'
ZSH_HIGHLIGHT_STYLES[double-quoted-argument-unclosed]='fg=#de5059'
ZSH_HIGHLIGHT_STYLES[rc-quote]='fg=#d99137'
## Variables
ZSH_HIGHLIGHT_STYLES[dollar-quoted-argument]='fg=#434343'
ZSH_HIGHLIGHT_STYLES[dollar-quoted-argument-unclosed]='fg=#de5059'
ZSH_HIGHLIGHT_STYLES[dollar-double-quoted-argument]='fg=#434343'
ZSH_HIGHLIGHT_STYLES[assign]='fg=#434343'
ZSH_HIGHLIGHT_STYLES[named-fd]='fg=#434343'
ZSH_HIGHLIGHT_STYLES[numeric-fd]='fg=#434343'
## No category relevant in spec
ZSH_HIGHLIGHT_STYLES[unknown-token]='fg=#de5059'
ZSH_HIGHLIGHT_STYLES[path]='fg=#434343,underline'
ZSH_HIGHLIGHT_STYLES[path_pathseparator]='fg=#ca2a40,underline'
ZSH_HIGHLIGHT_STYLES[path_prefix]='fg=#434343,underline'
ZSH_HIGHLIGHT_STYLES[path_prefix_pathseparator]='fg=#ca2a40,underline'
ZSH_HIGHLIGHT_STYLES[globbing]='fg=#434343'
ZSH_HIGHLIGHT_STYLES[history-expansion]='fg=#8545e3'
#ZSH_HIGHLIGHT_STYLES[command-substitution]='fg=?'
#ZSH_HIGHLIGHT_STYLES[command-substitution-unquoted]='fg=?'
#ZSH_HIGHLIGHT_STYLES[process-substitution]='fg=?'
#ZSH_HIGHLIGHT_STYLES[arithmetic-expansion]='fg=?'
ZSH_HIGHLIGHT_STYLES[back-quoted-argument-unclosed]='fg=#de5059'
ZSH_HIGHLIGHT_STYLES[redirection]='fg=#434343'
ZSH_HIGHLIGHT_STYLES[arg0]='fg=#434343'
ZSH_HIGHLIGHT_STYLES[default]='fg=#434343'
ZSH_HIGHLIGHT_STYLES[cursor]='fg=#434343'
