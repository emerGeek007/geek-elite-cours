const GeekAuth = (() => {
    const iterations = 210000;
    const accounts = [
        { username: 'eleve1', salt: 'fyAMTMiFSwPokNXeHtHydg==', hash: 'CdF6lopdDK+eTbEIPxyUc0p3v8TwhtUqTKXcdM0I38Y=' },
        { username: 'eleve2', salt: 'IcTM1i8lCfRRDPI4q3xHoQ==', hash: 't38rmih4zJxn6emadK+e4ki7bdYTRg8DyDMBoH7kBmQ=' },
        { username: 'eleve3', salt: 'MnISIcTyNwlbvT90WXKlKA==', hash: 'ZEACzjSbncLJdaDwZWh97vNX/2HsAPFdF1p1rZsDcL8=' },
        { username: 'eleve4', salt: 'iZTynBKUaZQ1vVRqdRTwow==', hash: 'zTB95IixwVALy52BdI1HUEBvyAxrgi26SWeuzdbJekQ=' },
        { username: 'eleve5', salt: 'RSkONxjK/+saIWXWWvCmvA==', hash: 'TvMm+6BrkUp+EC9hAVhnINW4CdiymAwMSGyH+EaGKg0=' },
        { username: 'eleve6', salt: 'Wgk881RL+xAazbVRkCYhTQ==', hash: 'u+AE18Sc0Kp2dJoR8aH2UbxaObm/EI665oVaE+efhPA=' }
    ];

    function findAccount(username) {
        const name = String(username || '').trim().toLowerCase();
        return accounts.find((account) => account.username === name) || null;
    }

    function sameText(left, right) {
        if (left.length !== right.length) {
            return false;
        }
        let difference = 0;
        for (let index = 0; index < left.length; index += 1) {
            difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
        }
        return difference === 0;
    }

    async function verify(username, password) {
        const account = findAccount(username);
        if (!account || !password) {
            return null;
        }

        const salt = Uint8Array.from(atob(account.salt), (char) => char.charCodeAt(0));
        const key = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(password),
            'PBKDF2',
            false,
            ['deriveBits']
        );
        const bits = await crypto.subtle.deriveBits({
            name: 'PBKDF2',
            salt,
            iterations,
            hash: 'SHA-256'
        }, key, 256);
        const bytes = new Uint8Array(bits);
        let binary = '';
        bytes.forEach((value) => {
            binary += String.fromCharCode(value);
        });

        if (!sameText(btoa(binary), account.hash)) {
            return null;
        }
        return account.username;
    }

    return { findAccount, verify };
})();
