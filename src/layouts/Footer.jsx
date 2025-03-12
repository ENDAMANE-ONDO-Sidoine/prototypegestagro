import React from "react";
import { Box, Typography, IconButton, Container, Grid } from "@mui/material";
import { FaFacebook, FaYoutube, FaWhatsapp } from "react-icons/fa";

const Footer = () => {
    return (
        <Box component="footer" sx={{ bgcolor: "success.main", color: "white", py: 2 }}>
            <Container maxWidth="">
                <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={12} sm={6} textAlign={{ xs: "center", sm: "center" }}>
                        <Typography variant="body1">
                            &copy; {new Date().getFullYear()} GestAgro. Tous droits réservés.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} textAlign={{ xs: "center", sm: "center" }}>
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                            <IconButton
                                component="a"
                                href="https://www.facebook.com/profile.php?id=61571203484560"
                                aria-label="Facebook"
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ color: "white", "&:hover": { color: "#1877f2" } }}
                            >
                                <FaFacebook size={30} />
                            </IconButton>
                            <IconButton
                                component="a"
                                href="#"
                                aria-label="YouTube"
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ color: "white", "&:hover": { color: "#ff0000" } }}
                            >
                                <FaYoutube size={30} />
                            </IconButton>
                            <IconButton
                                component="a"
                                href="#"
                                aria-label="WhatsApp"
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ color: "white", "&:hover": { color: "#25d366" } }}
                            >
                                <FaWhatsapp size={30} />
                            </IconButton>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Footer;
