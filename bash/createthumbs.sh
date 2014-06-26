#!/bin/bash

echo "Generating thumbnails..."
for img in `ls *.jpg`
do
convert -quality 80 -define jpeg:size=320x180 "$img" -thumbnail 320x180^ -gravity North -extent 320x180 thumbs/"$img"
done
echo "All Done!" 
