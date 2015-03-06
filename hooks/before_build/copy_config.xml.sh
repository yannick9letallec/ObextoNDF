#! /bin/bash
cp ./www/config.xml ./

if [[ $? -eq 0 ]] 
then
	echo "[OK] Copie fichier config.xml"
else
	echo "[KO] Copie fichier config.xml"
fi
