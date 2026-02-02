import io from 'socket.io-client'
const overrideStyle = {
    display: 'flex',
    margin: '0 auto',
    height: '24px',
    justifyContent: 'center',
    alignItems: "center"
}


const production = 'production'
const dev = 'development'

const mode = process.env.REACT_APP_MODE;

let app_url, api_url

if (mode === production) {
    app_url = "https://e-commerce-store-dashboard-jet.vercel.app"
    api_url = " https://e-commerce-store-backend-2rgq.onrender.com"
} else {
    app_url = 'http://localhost:3001'
    api_url = 'http://localhost:5000'
}

const socket = io(api_url)

export {
    socket,
    app_url,
    api_url,
    overrideStyle
}