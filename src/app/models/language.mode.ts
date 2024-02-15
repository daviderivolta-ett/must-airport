export enum LANGUAGE {
    Italian = 'it',
    English = 'en'
}

export class Language {
    static parseLanguage(string: string): LANGUAGE {
        let language: LANGUAGE;
        switch (string) {
            case 'en':
                language = LANGUAGE.English;
                break;

            case 'it':
                language = LANGUAGE.Italian;
                break;

            default:
                language = LANGUAGE.Italian;
                break;
        }
        return language;
    }
}