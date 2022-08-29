# React Google Reacnslate
Free for use google translate api
<br />
Can use on React and React Native

```yarn
yarn add react-google-translator
```
Or
```npm
npm install react-google-translator --save 
```

## Usage

```javascript
import googleTranslate from 'react-google-translator'

const ExampeComponent = () => {
    const {
        isTranslateSuccess,
        isTranslating,
        isError,
        translateMessage,
        onTranslate,
    } = googleTranslate()

    return (
        <div>
        <span>Original: Hello</span>
        {isTranslateSuccess && <span>Translated: {translateMessage}</span>}
        {isTranslating && <button>Translating...</button>}
        {!isTranslateSuccess && <button onPress={() =: onTranslate({
        content: 'Hello',
        languageTo: 'th'
            })}>Translate</button>}
        {isTranslateSuccess && <button>Translate again</button>}
        <div>
    )
}
```