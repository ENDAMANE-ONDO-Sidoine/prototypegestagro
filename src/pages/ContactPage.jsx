import React from 'react';
import { TextField, Button, Container, Typography, Box, Grid } from '@mui/material';
import { Email, Person, Subject, Message } from '@mui/icons-material';
import { styled } from '@mui/system';

// Styles personnalisés pour le bouton
const SubmitButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#1976d2',
    color: '#fff',
    '&:hover': {
        backgroundColor: '#115293',
        transform: 'scale(1.05)',
        transition: 'transform 0.2s ease-in-out',
    },
}));

const ContactPage = () => {
    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        console.log('Données du formulaire :', data);
        alert('Merci pour votre message ! Nous vous répondrons bientôt.');
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
            <Typography variant="h3" component="h1" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                Contactez-nous
            </Typography>
            <Typography variant="body1" align="center" sx={{ mb: 4, color: '#555' }}>
                Nous sommes là pour répondre à vos questions. Remplissez le formulaire ci-dessous et nous vous répondrons dès que possible.
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={3}>
                    {/* Champ Nom */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            required
                            id="name"
                            label="Nom complet"
                            name="name"
                            autoComplete="name"
                            variant="outlined"
                            InputProps={{
                                startAdornment: <Person sx={{ color: '#1976d2', mr: 1 }} />,
                            }}
                        />
                    </Grid>

                    {/* Champ Email */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            required
                            id="email"
                            label="Adresse email"
                            name="email"
                            autoComplete="email"
                            variant="outlined"
                            InputProps={{
                                startAdornment: <Email sx={{ color: '#1976d2', mr: 1 }} />,
                            }}
                        />
                    </Grid>

                    {/* Champ Sujet */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            required
                            id="subject"
                            label="Sujet"
                            name="subject"
                            variant="outlined"
                            InputProps={{
                                startAdornment: <Subject sx={{ color: '#1976d2', mr: 1 }} />,
                            }}
                        />
                    </Grid>

                    {/* Champ Message */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            required
                            id="message"
                            label="Message"
                            name="message"
                            multiline
                            rows={6}
                            variant="outlined"
                            InputProps={{
                                startAdornment: <Message sx={{ color: '#1976d2', mr: 1, alignSelf: 'flex-start', mt: 1 }} />,
                            }}
                        />
                    </Grid>

                    {/* Bouton de soumission */}
                    <Grid item xs={12}>
                        <SubmitButton
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            sx={{ mt: 2 }}
                        >
                            Envoyer
                        </SubmitButton>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default ContactPage;