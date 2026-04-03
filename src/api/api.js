

import axios from 'axios'
import { api_url } from '../utils/utils.js'

const api = axios.create({
    baseURL: `${api_url}/api`
})

export default api