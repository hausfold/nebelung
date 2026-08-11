# Catppuccin Mocha Theme (for zsh-syntax-highlighting)
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
ZSH_HIGHLIGHT_STYLES[comment]='fg=#5b5b5b'
## Constants
## Entitites
## Functions/methods
ZSH_HIGHLIGHT_STYLES[alias]='fg=#abe1a6'
ZSH_HIGHLIGHT_STYLES[suffix-alias]='fg=#abe1a6'
ZSH_HIGHLIGHT_STYLES[global-alias]='fg=#abe1a6'
ZSH_HIGHLIGHT_STYLES[function]='fg=#abe1a6'
ZSH_HIGHLIGHT_STYLES[command]='fg=#abe1a6'
ZSH_HIGHLIGHT_STYLES[precommand]='fg=#abe1a6,italic'
ZSH_HIGHLIGHT_STYLES[autodirectory]='fg=#f5b58e,italic'
ZSH_HIGHLIGHT_STYLES[single-hyphen-option]='fg=#f5b58e'
ZSH_HIGHLIGHT_STYLES[double-hyphen-option]='fg=#f5b58e'
ZSH_HIGHLIGHT_STYLES[back-quoted-argument]='fg=#c9a8f1'
## Keywords
## Built ins
ZSH_HIGHLIGHT_STYLES[builtin]='fg=#abe1a6'
ZSH_HIGHLIGHT_STYLES[reserved-word]='fg=#abe1a6'
ZSH_HIGHLIGHT_STYLES[hashed-command]='fg=#abe1a6'
## Punctuation
ZSH_HIGHLIGHT_STYLES[commandseparator]='fg=#ed8fa9'
ZSH_HIGHLIGHT_STYLES[command-substitution-delimiter]='fg=#d7d7d7'
ZSH_HIGHLIGHT_STYLES[command-substitution-delimiter-unquoted]='fg=#d7d7d7'
ZSH_HIGHLIGHT_STYLES[process-substitution-delimiter]='fg=#d7d7d7'
ZSH_HIGHLIGHT_STYLES[back-quoted-argument-delimiter]='fg=#ed8fa9'
ZSH_HIGHLIGHT_STYLES[back-double-quoted-argument]='fg=#ed8fa9'
ZSH_HIGHLIGHT_STYLES[back-dollar-quoted-argument]='fg=#ed8fa9'
## Serializable / Configuration Languages
## Storage
## Strings
ZSH_HIGHLIGHT_STYLES[command-substitution-quoted]='fg=#f7e2b5'
ZSH_HIGHLIGHT_STYLES[command-substitution-delimiter-quoted]='fg=#f7e2b5'
ZSH_HIGHLIGHT_STYLES[single-quoted-argument]='fg=#f7e2b5'
ZSH_HIGHLIGHT_STYLES[single-quoted-argument-unclosed]='fg=#e6a3ad'
ZSH_HIGHLIGHT_STYLES[double-quoted-argument]='fg=#f7e2b5'
ZSH_HIGHLIGHT_STYLES[double-quoted-argument-unclosed]='fg=#e6a3ad'
ZSH_HIGHLIGHT_STYLES[rc-quote]='fg=#f7e2b5'
## Variables
ZSH_HIGHLIGHT_STYLES[dollar-quoted-argument]='fg=#d7d7d7'
ZSH_HIGHLIGHT_STYLES[dollar-quoted-argument-unclosed]='fg=#e6a3ad'
ZSH_HIGHLIGHT_STYLES[dollar-double-quoted-argument]='fg=#d7d7d7'
ZSH_HIGHLIGHT_STYLES[assign]='fg=#d7d7d7'
ZSH_HIGHLIGHT_STYLES[named-fd]='fg=#d7d7d7'
ZSH_HIGHLIGHT_STYLES[numeric-fd]='fg=#d7d7d7'
## No category relevant in spec
ZSH_HIGHLIGHT_STYLES[unknown-token]='fg=#e6a3ad'
ZSH_HIGHLIGHT_STYLES[path]='fg=#d7d7d7,underline'
ZSH_HIGHLIGHT_STYLES[path_pathseparator]='fg=#ed8fa9,underline'
ZSH_HIGHLIGHT_STYLES[path_prefix]='fg=#d7d7d7,underline'
ZSH_HIGHLIGHT_STYLES[path_prefix_pathseparator]='fg=#ed8fa9,underline'
ZSH_HIGHLIGHT_STYLES[globbing]='fg=#d7d7d7'
ZSH_HIGHLIGHT_STYLES[history-expansion]='fg=#c9a8f1'
#ZSH_HIGHLIGHT_STYLES[command-substitution]='fg=?'
#ZSH_HIGHLIGHT_STYLES[command-substitution-unquoted]='fg=?'
#ZSH_HIGHLIGHT_STYLES[process-substitution]='fg=?'
#ZSH_HIGHLIGHT_STYLES[arithmetic-expansion]='fg=?'
ZSH_HIGHLIGHT_STYLES[back-quoted-argument-unclosed]='fg=#e6a3ad'
ZSH_HIGHLIGHT_STYLES[redirection]='fg=#d7d7d7'
ZSH_HIGHLIGHT_STYLES[arg0]='fg=#d7d7d7'
ZSH_HIGHLIGHT_STYLES[default]='fg=#d7d7d7'
ZSH_HIGHLIGHT_STYLES[cursor]='fg=#d7d7d7'
