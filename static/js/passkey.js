// =========================================================
// ELDERCARE MINDSPACE — PASSKEY / FACE ID
// =========================================================

function base64urlToUint8Array(base64url) {
    const padding = "=".repeat((4 - base64url.length % 4) % 4);

    const base64 = (
        base64url
            .replace(/-/g, "+")
            .replace(/_/g, "/") + padding
    );

    const rawData = atob(base64);

    return Uint8Array.from(
        [...rawData].map(char => char.charCodeAt(0))
    );
}


function arrayBufferToBase64url(buffer) {
    const bytes = new Uint8Array(buffer);

    let binary = "";

    bytes.forEach(byte => {
        binary += String.fromCharCode(byte);
    });

    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}


// =========================================================
// REGISTER PASSKEY
// =========================================================

async function registerPasskey() {

    try {

        if (!window.PublicKeyCredential) {

            alert(
                "Passkeys are not supported by this browser."
            );

            return;
        }

        const optionsResponse = await fetch(
            "/api/passkey/register/options"
        );

        const options = await optionsResponse.json();

        if (!optionsResponse.ok) {

            alert(
                options.message ||
                "Unable to start passkey registration."
            );

            return;
        }


        // Convert challenge

        options.challenge =
            base64urlToUint8Array(
                options.challenge
            );


        // Convert user ID

        if (options.user && options.user.id) {

            options.user.id =
                base64urlToUint8Array(
                    options.user.id
                );
        }


        // Convert excluded credentials

        if (options.excludeCredentials) {

            options.excludeCredentials =
                options.excludeCredentials.map(
                    credential => ({
                        ...credential,
                        id: base64urlToUint8Array(
                            credential.id
                        )
                    })
                );
        }


        // Ask browser/device for passkey

        const credential =
            await navigator.credentials.create({
                publicKey: options
            });


        if (!credential) {

            alert(
                "Passkey registration was cancelled."
            );

            return;
        }


        // Prepare credential data

        const credentialData = {

            id: credential.id,

            rawId:
                arrayBufferToBase64url(
                    credential.rawId
                ),

            type: credential.type,

            response: {

                clientDataJSON:
                    arrayBufferToBase64url(
                        credential.response.clientDataJSON
                    ),

                attestationObject:
                    arrayBufferToBase64url(
                        credential.response.attestationObject
                    )
            }
        };


        // Send credential to Flask

        const verifyResponse =
            await fetch(
                "/api/passkey/register/verify",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            credentialData
                        )
                }
            );


        const result =
            await verifyResponse.json();


        if (!verifyResponse.ok || !result.success) {

            alert(
                result.message ||
                "Passkey registration failed."
            );

            return;
        }


        alert(
            "Passkey registered successfully! 🔐"
        );


    } catch (error) {

        console.error(
            "Passkey registration error:",
            error
        );

        alert(
            "Passkey registration was cancelled or could not be completed."
        );
    }
}


// =========================================================
// LOGIN WITH PASSKEY
// =========================================================

async function loginWithPasskey() {

    try {

        if (!window.PublicKeyCredential) {

            alert(
                "Passkeys are not supported by this browser."
            );

            return;
        }


        const usernameInput =
            document.querySelector(
                'input[name="username"]'
            );


        const username =
            usernameInput
                ? usernameInput.value.trim()
                : "";


        if (!username) {

            alert(
                "Please enter your username first."
            );

            if (usernameInput) {
                usernameInput.focus();
            }

            return;
        }


        const optionsResponse =
            await fetch(
                "/api/passkey/login/options",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        username: username
                    })
                }
            );


        const options =
            await optionsResponse.json();


        if (!optionsResponse.ok) {

            alert(
                options.message ||
                "Unable to start passkey login."
            );

            return;
        }


        // Convert challenge

        options.challenge =
            base64urlToUint8Array(
                options.challenge
            );


        // Convert allowed credentials

        if (options.allowCredentials) {

            options.allowCredentials =
                options.allowCredentials.map(
                    credential => ({
                        ...credential,

                        id:
                            base64urlToUint8Array(
                                credential.id
                            )
                    })
                );
        }


        // Ask device for authentication

        const credential =
            await navigator.credentials.get({
                publicKey: options
            });


        if (!credential) {

            alert(
                "Passkey login was cancelled."
            );

            return;
        }


        // Prepare authentication response

        const credentialData = {

            id: credential.id,

            rawId:
                arrayBufferToBase64url(
                    credential.rawId
                ),

            type: credential.type,

            response: {

                clientDataJSON:
                    arrayBufferToBase64url(
                        credential.response.clientDataJSON
                    ),

                authenticatorData:
                    arrayBufferToBase64url(
                        credential.response.authenticatorData
                    ),

                signature:
                    arrayBufferToBase64url(
                        credential.response.signature
                    )
            }
        };


        // Some authenticators provide userHandle

        if (
            credential.response.userHandle
        ) {

            credentialData.response.userHandle =
                arrayBufferToBase64url(
                    credential.response.userHandle
                );
        }


        // Send authentication response

        const verifyResponse =
            await fetch(
                "/api/passkey/login/verify",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            credentialData
                        )
                }
            );


        const result =
            await verifyResponse.json();


        if (
            !verifyResponse.ok ||
            !result.success
        ) {

            alert(
                result.message ||
                "Passkey login failed."
            );

            return;
        }


        // Login successful

        window.location.href = "/";


    } catch (error) {

        console.error(
            "Passkey login error:",
            error
        );

        alert(
            "Passkey login was cancelled or could not be completed."
        );
    }
}