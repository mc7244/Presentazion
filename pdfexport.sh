#!/bin/sh

wkhtmltopdf --margin-top 0 --margin-bottom 0 --margin-left 0 --margin-right 0 --page-width 199.5 --page-height 150  --user-style-sheet presentazion-print.css --outline-depth 0 presentazion.html presentazion.pdf
