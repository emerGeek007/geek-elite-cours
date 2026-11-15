const GeekAuth = (() => {
    const iterations = 210000;
    const accounts = [
        { username: 'Blondy', salt: '7FH4KUBdpeTT5RoL9z96oA==', hash: 'D2M9iDGLsoFFJ2k77M0REJ6oanXSbIHJplOypA72J7w=' },
        { username: 'Tetie', salt: 'zpyu6s/4tKkpGBilNHZ+8Q==', hash: 'TdNZclDhhXvl9q8M3XJOIck97pZHGvtUP9r2SMR0Hlg=' },
        { username: 'LeProHt', salt: 'LYxm4rxSx5HzOaGrSFJHwg==', hash: 'omqxdrPHPa9ZecRWIcT6twcfU4ud0RhfqqSE6LYoCdY=' },
        { username: 'Aris Gogo', salt: '6Cao1bLA4DKd6+Z3nn33Mg==', hash: 'PTYC13vwFw5iaR8KCT2KQF0hKdSYiUnWAHPR+D8oSfg=' },
        { username: 'CEO-TMD', salt: 'bxUXm8PUwQwOhhTcgwjuow==', hash: 'Qu13v+AjlHxUgoEy3pIPRIjTuvNboDC9lGNz8SfHCNs=' },
        { username: 'CEO-GEEK', salt: 'RnsFb8bMhOtMdtY/4P4Flw==', hash: 'xeTE3eko/sdoJn7cp/nWXCc8Na4yNTY91lfvmy8dxGQ=' }
    ];

    function findAccount(username) {
        const name = String(username || '').trim().toLowerCase();
        return accounts.find((account) => account.username.toLowerCase() === name) || null;
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
