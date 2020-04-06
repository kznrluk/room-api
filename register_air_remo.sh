#!/usr/bin/env bash

airtarget=(airauto aircool airheat airdry)

for target in ${airtarget[@]}
do
  sleep 3
  for ((i=17; i<31; i++)) do
    echo irrp.py -r -g18 -f codes.json $target$i --no-confirm --post 130
    python irrp.py -r -g18 -f codes.json $target$i --no-confirm --post 130
  done
done
