import {
	useState,
} from 'react'
import queryString from 'query-string'
import axios from 'axios'
//

const googleTranslateUri = 'https://translate.google.com/_/TranslateWebserverUi/data/batchexecute?'
function translateApi(text, lang) {
	let opts = {}

	opts.from = 'auto'
	opts.to = lang || 'en'

	var data = {
		rpcids: 'MkEWBc',
		'f.sid': '',
		bl: '',
		hl: 'en-US',
		'soc-app': 1,
		'soc-platform': 1,
		'soc-device': 1,
		_reqid: Math.floor(1000 + Math.random() * 9000),
		rt: 'c',
	}
	const url = googleTranslateUri + queryString.stringify(data)

	const body =
		'f.req=' +
		encodeURIComponent(
			JSON.stringify([
				[
					[
						'MkEWBc',
						JSON.stringify([
							[text, opts.from, opts.to, true],
							[null],
						]),
						null,
						'generic',
					],
				],
			])
		) +
		'&'

	return axios
		.post(url, body, {
			headers: {
				'content-type':
					'application/x-www-form-urlencoded;charset=UTF-8',
			},
		})
		.then(function (res) {
			var json = res.data.slice(6)
			var length = ''

			var result = {
				text: '',
				pronunciation: '',
				from: {
					language: {
						didYouMean: false,
						iso: '',
					},
					text: {
						autoCorrected: false,
						value: '',
						didYouMean: false,
					},
				},
				raw: '',
			}

			try {
				length = /^\d+/.exec(json)[0]
				json = JSON.parse(
					json.slice(
						length.length,
						parseInt(length, 10) + length.length
					)
				)
				json = JSON.parse(json[0][2])
				result.raw = json
			} catch (e) {
				return result
			}

			if (
				json[1][0][0][5] === undefined ||
				json[1][0][0][5] === null
			) {
				result.text = json[1][0][0][0]
			} else {
				result.text = json[1][0][0][5]
					.map(function (obj) {
						return obj[0]
					})
					.filter(Boolean)
					.join(' ')
			}
			result.pronunciation = json[1][0][0][1]

			// From language
			if (json[0] && json[0][1] && json[0][1][1]) {
				result.from.language.didYouMean = true
				result.from.language.iso = json[0][1][1][0]
			} else if (json[1][3] === 'auto') {
				result.from.language.iso = json[2]
			} else {
				result.from.language.iso = json[1][3]
			}

			// Did you mean & autocorrect
			if (json[0] && json[0][1] && json[0][1][0]) {
				var str = json[0][1][0][0][1]

				str = str.replace(/<b>(<i>)?/g, '[')
				str = str.replace(/(<\/i>)?<\/b>/g, ']')

				result.from.text.value = str

				if (json[0][1][0][2] === 1) {
					result.from.text.autoCorrected = true
				} else {
					result.from.text.didYouMean = true
				}
			}

			return result
		})
		.catch(function (err) {
			err.message += `\nUrl: ${url}`
			if (
				err.statusCode !== undefined &&
				err.statusCode !== 200
			) {
				err.code = 'BAD_REQUEST'
			} else {
				err.code = 'BAD_NETWORK'
			}
			throw err
		})
}

const googleTranslate = () => {

	const [isTranslateSuccess, setIsTranslateSuccess] = useState(false)
	const [translateMessage, setTranslatedMessage] = useState(null)
	const [isTranslating, setIsTranslating] = useState(false)
	const [isError, setIsError] = useState(false)

	const handleTranslate = ({ content, languageTo }) => {
        setIsTranslateSuccess(false)
        setIsError(false)
        setIsTranslating(true)
        if (translateMessage) {
            setIsTranslateSuccess(true)
        } else {
            translateApi(content, languageTo)
            .then((res) => {
                if (res && res.text) {
                    setTranslatedMessage(res.text)
                    setIsTranslateSuccess(true)
                    setIsTranslating(false)
                }
            })
            .catch((err) => {
                setIsTranslating(false)
                setIsError(true)
            })
        }
			

		if (isError) {
			setIsTranslateSuccess(false)
			setIsError(false)
			setIsTranslating(false)
		}
	}

	return {
        isTranslateSuccess,
        isTranslating,
        isError,
        translateMessage,
        onTranslate: handleTranslate,
    }
}

export default googleTranslate