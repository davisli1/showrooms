import React, { useState, useEffect } from 'react'
import { withAuthUser, withAuthUserTokenSSR } from 'next-firebase-auth'
import SetupsTable from '../components/SetupsTable'
import SetupsForm from '../components/SetupsForm'
import FeaturedSetup from '../components/FeaturedSetup'
import Layout from '../layout/layout'
import FullPageLoader from '../components/FullPageLoader'

const createData = (title, date, author, view) => {
  return { title, date, author, view }
}

const rows = [
  createData('Title 1', 'Today', 'michaelfromyeg', 'hide'),
  createData('Title 2', 'Today', 'hasanaltaf', 'hide'),
  createData('Title 3', 'Today', 'stuffybyliang', 'hide'),
  createData('Title 4', 'Today', 'projectsbyjackhe', 'hide'),
]

const Index = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    const fetchSetups = async () => {
      try {
        const result = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/setup')
        const resultJson = await result.json()
        console.log(resultJson)
        setData(resultJson)
        setLoading(false)
      } catch (e) {
        console.error(e)
        setData(rows)
        setLoading(false)
      }
    }
    fetchSetups()
  }, [])

  const handleHideRow = (id) => {
    setData(data.filter((row) => row._id !== id))
  }

  const handleFilterData = async (formData) => {
    try {
      const url = new URL(process.env.NEXT_PUBLIC_BACKEND_URL + '/setup')
      const filters = []
      for (const [key, value] of Object.entries(formData)) {
        const pair = {}
        pair[key] = value
        filters.push(pair)
      }
      const filtersString = JSON.stringify(filters)
      console.log(`${url}?filters=${filtersString}`)
      const result = await fetch(`${url}?filters=${filtersString}`)
      const resultJson = await result.json()
      setData(resultJson)
    } catch (e) {
      console.error(e)
      setData(rows)
    }
  }

  const handleDataChange = (index, clicked) => {
    const dataCopy = data.slice()
    dataCopy[index].upvotes = clicked
      ? dataCopy[index].upvotes - 1
      : dataCopy[index].upvotes + 1
    setData(dataCopy)
  }

  if (loading) {
    return <FullPageLoader />
  }
  return (
    <Layout title={'Home'}>
      <FeaturedSetup />
      <SetupsForm handleFilterData={handleFilterData} />
      <SetupsTable
        data={data}
        handleHideRow={handleHideRow}
        handleDataChange={handleDataChange}
      />
    </Layout>
  )
}

export const getServerSideProps = withAuthUserTokenSSR()()

export default withAuthUser()(Index)
