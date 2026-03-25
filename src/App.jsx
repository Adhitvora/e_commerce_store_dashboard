import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux'
import Router from './router/Router'
import ScrollToTop from './router/ScrollToTop'
import publicRoutes from './router/routes/publicRoutes'
import { getRoutes } from "./router/routes";
import { get_user_info } from "./store/Reducers/authReducer";
function App() {
  const dispatch = useDispatch()
  const { token } = useSelector(state => state.auth)
  const [allRoutes, setAllRoutes] = useState([...publicRoutes])
  useEffect(() => {
    const routes = getRoutes()
    setAllRoutes([...allRoutes, routes])
  }, [])
  useEffect(() => {
    if (token) {
      dispatch(get_user_info())
    }
  }, [token])

  useEffect(() => {
    if (!('scrollRestoration' in window.history)) return
    const previousScrollRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)

    return () => {
      window.history.scrollRestoration = previousScrollRestoration
    }
  }, [])

  return (
    <>
      <ScrollToTop />
      <Router allRoutes={allRoutes} />
    </>
  )
}

export default App;
