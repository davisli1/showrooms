import React, { useState } from 'react'
import Link from 'next/link'
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
import Thumbnail from './Thumbnail'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TablePagination from '@material-ui/core/TablePagination';
import Tooltip from '@material-ui/core/Tooltip';
import axios from 'axios';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography'

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'upvotes', numeric: true, disablePadding: false, label: 'Vote', helpText: 'Sort by upvotes. Find "best" posts by clicking twice.' },
  { id: 'title', numeric: false, disablePadding: false, label: 'Title', helpText: 'Sort by title (alphabetical order).' },
  { id: 'date', numeric: false, disablePadding: false, label: 'Date', helpText: 'Sort by date posted.' },
  { id: 'by', numeric: false, disablePadding: false, label: 'Author', helpText: 'Sort by author (alphabetical order).' },
  { id: 'tags', numeric: false, disablePadding: false, label: 'Tags', helpText: 'Sort by tags.' },
  { id: 'products', numeric: false, disablePadding: false, label: 'Products', helpText: 'Sort by products.' },
  { id: 'view', numeric: false, disablePadding: false, label: 'View', helpText: 'Hide or save posts.' },
  { id: 'thumbnail', numeric: false, disablePadding: false, label: 'Thumbnail', helpText: 'View post thumbnail.' },
];

function EnhancedTableHead(props) {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <Tooltip placement="top-start" key={headCell.id} title={headCell.helpText}>
            <TableCell
              key={headCell.id}
              align={'left'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <span className={classes.visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </span>
                ) : null}
              </TableSortLabel>
            </TableCell>
          </Tooltip>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object,
  numSelected: PropTypes.number,
  onRequestSort: PropTypes.func,
  onSelectAllClick: PropTypes.func,
  order: PropTypes.oneOf(['asc', 'desc']),
  orderBy: PropTypes.string,
  rowCount: PropTypes.number,
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    listStyle: 'none',
    padding: theme.spacing(0.5),
    margin: 0,
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
  chip: {
    margin: theme.spacing(0.5),
  },
}));

const SetupsTable = ({ data: rows, handleHideRow, handleDataChange }) => {
  const classes = useStyles()
  // const [votes, setVotes] = useState(Array.from({ length: rows ? rows.length : 0 }, (v, i) => i))
  const [clicked, setClicked] = useState(Array.from({ length: rows ? rows.length : 0 }, (v, i) => false))
  const [dense, setDense] = React.useState(false);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const normalizeDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const handleVote = async (e, index) => {
    e.preventDefault();
    const rowsCopy = rows.slice()
    const clickedCopy = clicked.slice()
    handleDataChange(index, clicked[index])
    if (clickedCopy[index]) {
      await axios({
        method: 'patch',
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/setup/${rowsCopy[index]._id}`,
        data: {
          upvotes: rowsCopy[index].upvotes,
        },
        headers: {}
      })
    } else {
      await axios({
        method: 'patch',
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/setup/${rowsCopy[index]._id}`,
        data: {
          upvotes: rowsCopy[index].upvotes,
        },
        headers: {}
      })
    }
    clickedCopy[index] = !clickedCopy[index]
    setClicked(clickedCopy)
  }

  const emailToUsername = (email) => {
    if (!email) return
    return email.split('@')[0]
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table size={dense ? 'small' : 'medium'} className={classes.table} aria-label="simple table">
          <EnhancedTableHead
            classes={classes}
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            rowCount={rows.length}
          />
          <TableBody>
            {rows &&
              stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow style={{ height: (dense ? 4 : 8) * rows.length }} key={`${row.title}-${index}`}>
                    <TableCell align="left">
                      <Votes handleVote={handleVote} hasClicked={clicked[index]} index={index} number={row.upvotes} />
                    </TableCell>
                    <TableCell align="left">{row.title}</TableCell>
                    <TableCell align="left">{normalizeDate(row.createdAt)}</TableCell>
                    <TableCell align="left">by <Link href={`/user/${emailToUsername(row.by)}`}><a>{'@' + emailToUsername(row.by)}</a></Link></TableCell>
                    <TableCell align="left">{row.tags[0] && row.tags[0].split(',').map((tag, index) => {
                      return (
                        <Chip
                          key={`tag-${index}`}
                          size="small"
                          label={tag}
                          className={classes.chip}
                        />
                      );
                    })}</TableCell>
                    <TableCell align="left">{row.products[0].slice(0, 2).map((product, index) => {
                      return (
                        <Typography variant="body2" key={`product-${index}`}>{product.description}</Typography>
                      )
                    })}
                    </TableCell>
                    <TableCell align="left">
                      <>
                        <Link href={`/setup/${row._id}`}>
                          <a href="">view</a>
                        </Link>
                        <br />
                        <a href="" onClick={(e) => { e.preventDefault(); handleHideRow(row._id) }}>hide</a>
                      </>
                    </TableCell>
                    <TableCell align="left">
                      <Link href={`/setup/${row._id}`}>
                        <a>
                          <Thumbnail id={row._id} src={row.img} />
                        </a>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </TableContainer >
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Compact view"
      />
    </>
  )
}

SetupsTable.propTypes = {
  handleDataChange: PropTypes.any,
  handleHideRow: PropTypes.any,
  data: PropTypes.any,
}

export default withAuthUser({
  // whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(SetupsTable)
