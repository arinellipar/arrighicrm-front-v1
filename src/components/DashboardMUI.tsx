"use client";

import React, { useState, useMemo } from "react";
import {
    Box,
    Grid,
    Paper,
    Typography,
    Button,
    IconButton,
    useTheme,
    Chip,
    Avatar,
    LinearProgress,
} from "@mui/material";
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
    GridToolbar,
} from "@mui/x-data-grid";
import {
    TrendingUp,
    TrendingDown,
    AttachMoney,
    People,
    Assignment,
    MoreVert,
    Notifications,
    Search,
    FilterList,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useEstatisticas } from "@/hooks/useEstatisticas";
import { useClientes } from "@/hooks/useClientes";

// --- Styled Components (using sx prop for better performance in MUI v5+) ---

const StatCard = ({
    title,
    value,
    trend,
    trendValue,
    icon,
    color,
}: {
    title: string;
    value: string | number;
    trend: "up" | "down" | "neutral";
    trendValue: string;
    icon: React.ReactNode;
    color: string;
}) => {
    const theme = useTheme();

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                height: "100%",
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
                border: "1px solid rgba(255, 255, 255, 0.05)",
                borderRadius: 3,
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                },
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background: color,
                    opacity: 0.1,
                    filter: "blur(30px)",
                }}
            />
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                        {value}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5}>
                        {trend === "up" ? (
                            <TrendingUp sx={{ color: "success.main", fontSize: 16 }} />
                        ) : trend === "down" ? (
                            <TrendingDown sx={{ color: "error.main", fontSize: 16 }} />
                        ) : null}
                        <Typography
                            variant="caption"
                            color={
                                trend === "up"
                                    ? "success.main"
                                    : trend === "down"
                                        ? "error.main"
                                        : "text.secondary"
                            }
                            fontWeight="bold"
                        >
                            {trendValue}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            vs. mês anterior
                        </Typography>
                    </Box>
                </Box>
                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: `rgba(${color === "#3b82f6"
                            ? "59, 130, 246"
                            : color === "#eab308"
                                ? "234, 179, 8"
                                : "16, 185, 129"
                            }, 0.1)`,
                        color: color,
                        display: "flex",
                    }}
                >
                    {icon}
                </Box>
            </Box>
        </Paper>
    );
};

export default function DashboardMUI() {
    const theme = useTheme();
    const { receita, loading: statsLoading } = useEstatisticas();
    const { clientes, loading: clientesLoading } = useClientes();

    // Mock Data for DataGrid
    const rows = useMemo(() => {
        return clientes.slice(0, 10).map((cliente) => ({
            id: cliente.id,
            nome: cliente.nome,
            email: cliente.email,
            status: cliente.status || "Ativo",
            valor: `R$ ${(Math.random() * 5000 + 1000).toFixed(2)}`,
            progresso: Math.floor(Math.random() * 100),
        }));
    }, [clientes]);

    const columns: GridColDef[] = [
        { field: "nome", headerName: "Cliente", width: 200 },
        { field: "email", headerName: "Email", width: 250 },
        {
            field: "status",
            headerName: "Status",
            width: 120,
            renderCell: (params: GridRenderCellParams) => (
                <Chip
                    label={params.value}
                    size="small"
                    color={params.value === "Ativo" ? "success" : "default"}
                    variant="outlined"
                    sx={{ borderRadius: 1 }}
                />
            ),
        },
        {
            field: "valor",
            headerName: "Valor Contrato",
            width: 150,
        },
        {
            field: "progresso",
            headerName: "Progresso",
            width: 200,
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ width: "100%", display: "flex", alignItems: "center" }}>
                    <Box sx={{ width: "100%", mr: 1 }}>
                        <LinearProgress
                            variant="determinate"
                            value={params.value as number}
                            sx={{
                                height: 6,
                                borderRadius: 5,
                                backgroundColor: theme.palette.action.hover,
                                "& .MuiLinearProgress-bar": {
                                    borderRadius: 5,
                                    backgroundImage:
                                        "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
                                },
                            }}
                        />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">{`${Math.round(
                            params.value as number
                        )}%`}</Typography>
                    </Box>
                </Box>
            ),
        },
        {
            field: "actions",
            headerName: "",
            width: 50,
            renderCell: () => (
                <IconButton size="small">
                    <MoreVert />
                </IconButton>
            ),
        },
    ];

    return (
        <Box sx={{ flexGrow: 1, p: 0 }}>
            {/* Header Section */}
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={4}
                component={motion.div}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Box>
                    <Typography variant="h4" fontWeight="800" gutterBottom>
                        Dashboard
                        <Box component="span" sx={{ color: "primary.main" }}>
                            .
                        </Box>
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Visão geral do desempenho do seu escritório.
                    </Typography>
                </Box>
                <Box display="flex" gap={2}>
                    <Button
                        variant="outlined"
                        startIcon={<FilterList />}
                        sx={{ borderColor: "rgba(255,255,255,0.1)" }}
                    >
                        Filtros
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Assignment />}
                        sx={{
                            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                            boxShadow: "0 4px 14px 0 rgba(59, 130, 246, 0.4)",
                        }}
                    >
                        Novo Relatório
                    </Button>
                </Box>
            </Box>

            {/* Stats Grid */}
            <Grid container spacing={3} mb={4}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{ height: "100%" }}
                    >
                        <StatCard
                            title="Receita Total"
                            value={`R$ ${receita?.ReceitaTotal?.toLocaleString() || "0"}`}
                            trend="up"
                            trendValue="+12.5%"
                            icon={<AttachMoney />}
                            color="#10b981"
                        />
                    </motion.div>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ height: "100%" }}
                    >
                        <StatCard
                            title="Clientes Ativos"
                            value={clientes.length}
                            trend="up"
                            trendValue="+5.2%"
                            icon={<People />}
                            color="#3b82f6"
                        />
                    </motion.div>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{ height: "100%" }}
                    >
                        <StatCard
                            title="Novos Contratos"
                            value="24"
                            trend="down"
                            trendValue="-2.4%"
                            icon={<Assignment />}
                            color="#eab308"
                        />
                    </motion.div>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        style={{ height: "100%" }}
                    >
                        <StatCard
                            title="Taxa de Conversão"
                            value="3.2%"
                            trend="up"
                            trendValue="+0.8%"
                            icon={<TrendingUp />}
                            color="#8b5cf6"
                        />
                    </motion.div>
                </Grid>
            </Grid>

            {/* Main Content Grid */}
            <Grid container spacing={3}>
                {/* Data Grid Section */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 0,
                            height: 500,
                            background: theme.palette.background.paper,
                            border: "1px solid rgba(255, 255, 255, 0.05)",
                            borderRadius: 3,
                            overflow: "hidden",
                        }}
                    >
                        <Box p={3} borderBottom="1px solid rgba(255, 255, 255, 0.05)">
                            <Typography variant="h6" fontWeight="bold">
                                Clientes Recentes
                            </Typography>
                        </Box>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            initialState={{
                                pagination: {
                                    paginationModel: { page: 0, pageSize: 5 },
                                },
                            }}
                            pageSizeOptions={[5, 10]}
                            checkboxSelection
                            disableRowSelectionOnClick
                            sx={{
                                border: "none",
                                "& .MuiDataGrid-cell:focus": {
                                    outline: "none",
                                },
                            }}
                        />
                    </Paper>
                </Grid>

                {/* Side Panel / Activity Feed */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            height: 500,
                            background: theme.palette.background.paper,
                            border: "1px solid rgba(255, 255, 255, 0.05)",
                            borderRadius: 3,
                        }}
                    >
                        <Typography variant="h6" fontWeight="bold" mb={3}>
                            Atividades Recentes
                        </Typography>
                        <Box display="flex" flexDirection="column" gap={3}>
                            {[1, 2, 3, 4].map((item) => (
                                <Box key={item} display="flex" gap={2}>
                                    <Avatar
                                        sx={{
                                            bgcolor: theme.palette.primary.main,
                                            width: 40,
                                            height: 40,
                                        }}
                                    >
                                        A
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            Novo contrato assinado
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Cliente Arrighi Advogados assinou o contrato de prestação...
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                                            Há 2 horas
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
