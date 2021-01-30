import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import { withAuthUser } from 'next-firebase-auth'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import Votes from './Votes'

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
})

const SetupsTable = ({ data }) => {
  const classes = useStyles()

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="left">Vote</TableCell>
            <TableCell align="left">Title</TableCell>
            <TableCell align="left">Date</TableCell>
            <TableCell align="left">Author</TableCell>
            <TableCell align="left">View</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data &&
            data.map((row) => (
              <TableRow key={row.title}>
                <TableCell align="left">
                  <Votes number={5} />
                </TableCell>
                <TableCell align="left">{row.title}</TableCell>
                <TableCell align="left">{row.date}</TableCell>
                <TableCell align="left">{row.author}</TableCell>
                <TableCell align="left">{row.view}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

SetupsTable.propTypes = {
  data: PropTypes.any,
}

export default withAuthUser({
  // whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(SetupsTable)
