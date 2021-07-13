#!/usr/bin/env bash

# Register micro.js

envsubst < /payever/micro.config.json > /payever/micro.config.json.tmp
mv /payever/micro.config.json.tmp ./micro.config.json

register_microjs() {
    curl --user ${APPREGISTRY_CLIENT_USER}:${APPREGISTRY_CLIENT_PASSWORD} \
        --silent --output - --show-error --fail \
        --connect-timeout 3 \
        --max-time 5 \
        -X POST \
        -H "Content-Type:application/json" \
        "${MICRO_URL_APP_REGISTRY}/api/apps" -d "@/payever/micro.config.json"
}

while true; do
    echo -e "\n> Registering micro.js at ${MICRO_URL_APP_REGISTRY} \n"

    if register_microjs; then
        echo -e "> Successfully registered micro.js \n"
        break
    fi

    echo -e "> Unable to register micro.js, repeating \n"
    sleep 3
done


# Translation keys push

find ./translations -name '*.json' | while read filename; do
    domain_locale=$(basename "${filename}" | sed "s/.json//g;")
    filename=$(readlink -f "${filename}")

    echo -e "> Registering translation ${domain_locale} at ${MICRO_URL_PHP_TRANSLATION} \n"

    curl --user ${TRANSLATION_CLIENT_USER}:${TRANSLATION_CLIENT_PASSWORD} \
        --silent --output - --show-error --fail \
        --connect-timeout 3 \
        --max-time 5 \
        -X POST \
        -H "Content-Type:application/json" \
        "${MICRO_URL_PHP_TRANSLATION}/api/translation/${domain_locale}" -d "@$filename"

    echo -e "\n"
done

echo -e "\nDone\n"
