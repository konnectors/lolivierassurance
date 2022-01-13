const {
  BaseKonnector,
  requestFactory,
  // scrape,
  log,
  // utils,
  solveCaptcha
} = require('cozy-konnector-libs')

const jar = require('request').jar()
// const { CookieJar } = require('tough-cookie')

const request = requestFactory({
  debug: true,
  cheerio: true,
  json: true,
  jar
})

// const VENDOR = "l'Olivier Assurance"
const baseUrl = 'https://www.lolivier.fr'
const websiteKey = '6LeXbUAUAAAAABy5m6-jT3Ui0Q38GyofOKh7uPc_'

module.exports = new BaseKonnector(start)

async function start(fields, cozyParameters) {
  log('info', 'Authenticating ...')
  if (cozyParameters) log('debug', 'Found COZY_PARAMETERS')
  const authResp = await authenticate.bind(this)(fields.login, fields.password)
  log('info', 'Successfully logged in')

  log('info', 'Fetching the list of documents')
  const documents = await fetchDocuments(authResp)
  log('info', documents)

  // log('info', 'Parsing list of documents')
  // const documents = await parseDocuments($)
  // log('info', 'Saving data to Cozy')
  // await this.saveBills(documents, fields, {
  //   identifiers: ["l'Olivier assurance"]
  // })
}

async function authenticate(username, password) {
  // const baseConnection = await request({
  //   jar,
  //   url: `${baseUrl}`,
  //   method: 'GET'
  // })

  // log('info', baseConnection)

  // const loginPage = await request(`${baseUrl}/espace-perso/#/connexion`, {
  //   jar
  // })
  // log('info', loginPage)

  const captchaResp = await solveCaptcha({
    websiteURL: `${baseUrl}/espace-perso/#/connexion`,
    websiteKey
  })

  const loginResp = await request(
    `${baseUrl}/espace-perso/authentication/login/`,
    {
      jar,
      method: 'POST',
      json: {
        password: password,
        username: username,
        recaptchaResponse: `${captchaResp}`
      },
      resolveWithFullResponse: true
    }
  )
  // log('info', loginResp)

  const respBody = loginResp.request.response.body
  // log('info', loginResp.headers['set-cookie'])

  return respBody
}

async function fetchDocuments(authBody) {
  log('info', jar)
  const docsResp = await request({
    method: 'GET',
    url: `${baseUrl}/espace-perso/api/account/${authBody.account}/menuInfo/`,
    headers: {
      Authorization: `Bearer ${authBody.jwtToken}`,
      'Content-Type': 'application/json; charset=UTF-8'
    }
    // resolveWithFullResponse: true
  })

  log('info', docsResp)
}

// async function parseDocuments() {}
