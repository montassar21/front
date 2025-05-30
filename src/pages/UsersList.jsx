import React, { useEffect, useState } from "react";
import authService from "../services/authService";
import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell"; 
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import LockResetIcon from "@mui/icons-material/LockReset";
import Appbar from "./../components/Appbar";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("user"));
    const user = data?.user;

    if (!user || user.role.trim() !== "admin") {
      navigate("/login");
    } else {
      authService
        .getAllUsers()
        .then((res) => {
          if (res) setUsers(res);
        })
        .catch((err) => {
          console.error("Error fetching users:", err);
        });
    }
  }, [navigate]);

  const userDelete = (id) => {
    authService
      .deleteUser(id)
      .then(() => {
        toast.success("User has been deleted");
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
      })
      .catch((err) => {
        console.error("Error deleting user:", err);
        toast.error("Failed to delete user");
      });
  };

  const handleResetClick = (id) => {
    setSelectedUserId(id);
    setOpenDialog(true);
  };

  const handleResetSubmit = () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    authService
      .resetPassword(selectedUserId, newPassword)
      .then(() => {
        toast.success("Mot de passe réinitialisé avec succès");
        setOpenDialog(false);
        setNewPassword("");
        setSelectedUserId(null);
      })
      .catch((err) => {
        console.error("Erreur de réinitialisation:", err);
        toast.error("Échec de la réinitialisation du mot de passe");
      });
  };

  return (
    <>
      <Appbar />
      <Container sx={{ marginTop: "10%", marginBottom: "10%" }} maxWidth="xl">
        <Box>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Nom et prénom</StyledTableCell>
                  <StyledTableCell align="right">Email</StyledTableCell>
                  <StyledTableCell align="right">Role</StyledTableCell>
                  <StyledTableCell align="right">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <StyledTableRow key={u._id}>
                    <StyledTableCell component="th" scope="row">
                      {u.name}
                    </StyledTableCell>
                    <StyledTableCell align="right">{u.email}</StyledTableCell>
                    <StyledTableCell align="right">{u.role}</StyledTableCell>
                    <StyledTableCell align="right">
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => userDelete(u._id)}
                        sx={{ mr: 1 }}
                      >
                        Supprimer
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<LockResetIcon />}
                        onClick={() => handleResetClick(u._id)}
                      >
                        Réinitialiser le mot de passe
                      </Button>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Container>
      <Divider>
        <Chip label="Liste des utilisateurs" size="small" />
      </Divider>

      {/* Formulaire de réinitialisation de mot de passe */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nouveau mot de passe"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button onClick={handleResetSubmit} variant="contained" color="primary">
            Réinitialiser
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UsersList;
