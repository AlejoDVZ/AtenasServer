-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 23-11-2024 a las 22:02:07
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `atenasdb`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `actuaciones`
--

CREATE TABLE `actuaciones` (
  `id` int(11) NOT NULL,
  `actividad` varchar(255) NOT NULL,
  `resultado` varchar(255) NOT NULL,
  `reported` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `dateReport` date NOT NULL,
  `attachmentPath` mediumtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `actuaciones`
--

INSERT INTO `actuaciones` (`id`, `actividad`, `resultado`, `reported`, `dateReport`, `attachmentPath`) VALUES
(1, 'primera presentacion del caso', 'el ciudadano quedo loclo', '2024-11-22 22:41:46', '2024-11-22', NULL),
(2, 'caso incial', 'apertura de investigacion', '2024-11-23 15:28:34', '2024-11-07', 'C:\\Users\\user\\Documentos\\Server\\uploads\\4\\9\\file-1732375714975-449924816.png'),
(3, 'consulta familiar', 'se hizo una reunion con la familia del defendido', '2024-11-23 17:58:33', '2024-11-29', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `actuaciones_causas`
--

CREATE TABLE `actuaciones_causas` (
  `id` int(11) NOT NULL,
  `causa` int(11) NOT NULL,
  `actuacion` int(11) NOT NULL,
  `how_report` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `actuaciones_causas`
--

INSERT INTO `actuaciones_causas` (`id`, `causa`, `actuacion`, `how_report`) VALUES
(1, 8, 1, 29),
(2, 9, 2, 29),
(3, 9, 3, 29);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `arrested`
--

CREATE TABLE `arrested` (
  `id` int(11) NOT NULL,
  `defended` int(11) DEFAULT NULL,
  `stablisment` int(11) DEFAULT NULL,
  `provisional` tinyint(1) DEFAULT NULL,
  `arrestedDate` date DEFAULT NULL,
  `freed` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `arrested`
--

INSERT INTO `arrested` (`id`, `defended`, `stablisment`, `provisional`, `arrestedDate`, `freed`) VALUES
(3, 7, 2, NULL, '2024-11-20', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `causas`
--

CREATE TABLE `causas` (
  `id` int(11) NOT NULL,
  `defensoria` int(11) NOT NULL,
  `numberCausa` varchar(11) DEFAULT NULL,
  `dateB` date DEFAULT NULL,
  `dateA` date DEFAULT NULL,
  `tribunalRecord` varchar(255) DEFAULT NULL,
  `fiscalia` int(11) NOT NULL,
  `calification` varchar(255) DEFAULT NULL,
  `creation` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `causas`
--

INSERT INTO `causas` (`id`, `defensoria`, `numberCausa`, `dateB`, `dateA`, `tribunalRecord`, `fiscalia`, `calification`, `creation`) VALUES
(8, 4, '123456789', '2024-11-22', '2024-11-19', 'asdasd', 1, 'asdasd', '2024-11-21 22:21:34'),
(9, 4, '1223456789', '2024-11-22', '2024-11-23', '1234678514', 4, 'Asesinato', '2024-11-23 15:28:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `causas_defendido_usuario`
--

CREATE TABLE `causas_defendido_usuario` (
  `id` int(11) NOT NULL,
  `causa` int(11) NOT NULL,
  `defendido` int(11) NOT NULL,
  `usuario` int(11) NOT NULL,
  `creation` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `causas_defendido_usuario`
--

INSERT INTO `causas_defendido_usuario` (`id`, `causa`, `defendido`, `usuario`, `creation`) VALUES
(1, 8, 6, 29, '2024-11-21 22:21:34'),
(2, 9, 7, 29, '2024-11-23 15:28:00'),
(3, 9, 8, 29, '2024-11-23 15:28:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `causas_states`
--

CREATE TABLE `causas_states` (
  `id` int(11) NOT NULL,
  `causa` int(11) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `causas_states`
--

INSERT INTO `causas_states` (`id`, `causa`, `status`, `date`) VALUES
(4, 8, 1, '2024-11-21 22:23:24'),
(5, 9, 3, '2024-11-23 20:16:40');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `defended`
--

CREATE TABLE `defended` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `lastname` varchar(255) DEFAULT NULL,
  `typeDocument` int(11) DEFAULT NULL,
  `document` int(11) DEFAULT NULL,
  `sex` tinyint(6) NOT NULL,
  `birth` date DEFAULT NULL,
  `education` int(11) DEFAULT NULL,
  `captureOrder` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `defended`
--

INSERT INTO `defended` (`id`, `name`, `lastname`, `typeDocument`, `document`, `sex`, `birth`, `education`, `captureOrder`) VALUES
(6, 'asdasd', 'asdasd', 1, 123123123, 0, '2024-11-07', 2, 0),
(7, 'Adelson', 'Narea', 1, 18121271, 1, '2024-11-22', 4, 0),
(8, 'Christian ', 'Rodriguez', 1, 29345544, 0, '2024-11-05', 4, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `defensorias`
--

CREATE TABLE `defensorias` (
  `id` int(11) NOT NULL,
  `office` varchar(255) DEFAULT NULL,
  `number` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `defensorias`
--

INSERT INTO `defensorias` (`id`, `office`, `number`) VALUES
(4, 'Defensoría 4', 4),
(5, 'Defensoría 5', 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `defensorias_personal`
--

CREATE TABLE `defensorias_personal` (
  `id` int(11) NOT NULL,
  `defensoria` int(11) NOT NULL,
  `personal` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `defensorias_personal`
--

INSERT INTO `defensorias_personal` (`id`, `defensoria`, `personal`) VALUES
(6, 4, 29),
(5, 4, 34),
(7, 4, 37),
(4, 5, 21);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `educatiolevels`
--

CREATE TABLE `educatiolevels` (
  `id` int(11) NOT NULL,
  `level` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `educatiolevels`
--

INSERT INTO `educatiolevels` (`id`, `level`) VALUES
(1, 'Nulo'),
(2, 'Primaria'),
(3, 'Bachiller'),
(4, 'Superior');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fiscalias`
--

CREATE TABLE `fiscalias` (
  `id` int(11) NOT NULL,
  `number` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `fiscalias`
--

INSERT INTO `fiscalias` (`id`, `number`) VALUES
(1, 1),
(2, 2),
(3, 6),
(4, 7);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal`
--

CREATE TABLE `personal` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `lastname` varchar(255) DEFAULT NULL,
  `typeDocument` int(11) DEFAULT NULL,
  `document` int(11) DEFAULT NULL,
  `role` int(11) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `email` mediumtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `personal`
--

INSERT INTO `personal` (`id`, `name`, `lastname`, `typeDocument`, `document`, `role`, `password`, `email`) VALUES
(21, 'Enmanuel', 'Mota', 1, 30111222, 1, '$2b$10$1kjwyDZ4aZY955EWoN4nq.rDvNaKwQLssKypY3w8OXbiZL5wXE13e', 'Enmanuel-Mota@hotmail.com'),
(23, 'Jose ', 'Buonaffina', 1, 11111111, 1, '$2b$10$evuc1PRoUjP.S2DGOSAroutAHTMEasDa2wzPjruXq10q7UpyT7gni', 'jose.buonaffina@sigosa.com'),
(25, 'Alejandro', 'Velasquez', 1, 28315536, 2, '$2b$10$RybaX/y.wMpI4PQ9Co5VGO2PorL7vREQQsAcurCIU2ZQ0Al323lBe', 'DDPP04@atenas.com.ve'),
(26, 'valeriaaaa', 'marval', 2, 28577555, 5, '$2b$10$iK6r0NK3W1UTAHYoQTH0d.l6lBZQFa.GDOruKaiCLuYIZRJpOxBBK', 'DDPP05@atenas.com.ve'),
(29, 'usuario', 'usuario', 1, 123456, 1, '$2b$10$vIx4ZRipbZjmJbni6It4cO8H.quWIXxlrZdiAvQGjNK4VPb6QR1Je', 'usuario@gmail.com'),
(34, 'aaa', 'ee', 2, 111111, 1, '$2b$10$2m8cGJMF2AUC3/xM/78dx.yR1H32pmWfjoFvkWxq3tQMkIRJiU7.m', 'usuariodeprueba@gmail.com'),
(37, 'admin', 'admin', NULL, NULL, 5, '$2a$12$f6PjssORHbsT5iES1QpCAeY5S8XEWV0C4ArBIFZrCREjkQoChu4DC', 'admin@gmail.com');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal_status`
--

CREATE TABLE `personal_status` (
  `id` int(11) NOT NULL,
  `personal` int(11) NOT NULL,
  `status` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `phones`
--

CREATE TABLE `phones` (
  `id` int(11) NOT NULL,
  `number` varchar(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `phones`
--

INSERT INTO `phones` (`id`, `number`) VALUES
(20, '04123589666'),
(19, '04123589671'),
(28, '1111111'),
(24, '1234'),
(8, '412359671'),
(16, '41411111'),
(22, 'admin'),
(23, 'user'),
(21, 'usuariodepr');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `phone_personal`
--

CREATE TABLE `phone_personal` (
  `id` int(11) NOT NULL,
  `personal` int(11) DEFAULT NULL,
  `phone` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `phone_personal`
--

INSERT INTO `phone_personal` (`id`, `personal`, `phone`) VALUES
(13, 25, 19),
(14, 26, 20),
(17, 29, 23),
(22, 34, 28);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `role` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `role`) VALUES
(1, 'Defensor Titular'),
(2, 'Defensor Provisorio'),
(3, 'Asistente'),
(4, 'Analista'),
(5, 'Admin');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `stablisments`
--

CREATE TABLE `stablisments` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `stablisments`
--

INSERT INTO `stablisments` (`id`, `name`) VALUES
(1, 'San Antonio'),
(2, 'Puente Ayala');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `status`
--

CREATE TABLE `status` (
  `id` int(11) NOT NULL,
  `state` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `status`
--

INSERT INTO `status` (`id`, `state`) VALUES
(1, 'Activa'),
(2, 'Cerrada Administrativamente'),
(3, 'Paralizada'),
(4, 'Terminada');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tribunales`
--

CREATE TABLE `tribunales` (
  `id` int(11) NOT NULL,
  `nombre` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `type_documents`
--

CREATE TABLE `type_documents` (
  `id` int(11) NOT NULL,
  `type` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `type_documents`
--

INSERT INTO `type_documents` (`id`, `type`) VALUES
(1, 'V-'),
(2, 'E-');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `actuaciones`
--
ALTER TABLE `actuaciones`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `actuaciones_causas`
--
ALTER TABLE `actuaciones_causas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `causa` (`causa`),
  ADD KEY `actuacion` (`actuacion`),
  ADD KEY `how_report` (`how_report`);

--
-- Indices de la tabla `arrested`
--
ALTER TABLE `arrested`
  ADD PRIMARY KEY (`id`),
  ADD KEY `defended` (`defended`),
  ADD KEY `stablisment` (`stablisment`);

--
-- Indices de la tabla `causas`
--
ALTER TABLE `causas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `numberCausa` (`numberCausa`),
  ADD KEY `defensoria` (`defensoria`),
  ADD KEY `fiscalia` (`fiscalia`);

--
-- Indices de la tabla `causas_defendido_usuario`
--
ALTER TABLE `causas_defendido_usuario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `causa` (`causa`,`defendido`,`usuario`),
  ADD KEY `defendido` (`defendido`),
  ADD KEY `usuario` (`usuario`);

--
-- Indices de la tabla `causas_states`
--
ALTER TABLE `causas_states`
  ADD PRIMARY KEY (`id`),
  ADD KEY `causa` (`causa`),
  ADD KEY `status` (`status`);

--
-- Indices de la tabla `defended`
--
ALTER TABLE `defended`
  ADD PRIMARY KEY (`id`),
  ADD KEY `typeDocument` (`typeDocument`),
  ADD KEY `education` (`education`);

--
-- Indices de la tabla `defensorias`
--
ALTER TABLE `defensorias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `defensorias_personal`
--
ALTER TABLE `defensorias_personal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `defensoria` (`defensoria`,`personal`),
  ADD KEY `personal` (`personal`);

--
-- Indices de la tabla `educatiolevels`
--
ALTER TABLE `educatiolevels`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `fiscalias`
--
ALTER TABLE `fiscalias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `personal`
--
ALTER TABLE `personal`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`) USING HASH,
  ADD KEY `typeDocument` (`typeDocument`),
  ADD KEY `role` (`role`);

--
-- Indices de la tabla `personal_status`
--
ALTER TABLE `personal_status`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `phones`
--
ALTER TABLE `phones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `number` (`number`);

--
-- Indices de la tabla `phone_personal`
--
ALTER TABLE `phone_personal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `phone_personal_ibfk_1` (`personal`),
  ADD KEY `phone_personal_ibfk_2` (`phone`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `stablisments`
--
ALTER TABLE `stablisments`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `status`
--
ALTER TABLE `status`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `tribunales`
--
ALTER TABLE `tribunales`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `type_documents`
--
ALTER TABLE `type_documents`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `actuaciones`
--
ALTER TABLE `actuaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `actuaciones_causas`
--
ALTER TABLE `actuaciones_causas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `arrested`
--
ALTER TABLE `arrested`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `causas`
--
ALTER TABLE `causas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `causas_defendido_usuario`
--
ALTER TABLE `causas_defendido_usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `causas_states`
--
ALTER TABLE `causas_states`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `defended`
--
ALTER TABLE `defended`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `defensorias`
--
ALTER TABLE `defensorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `defensorias_personal`
--
ALTER TABLE `defensorias_personal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `educatiolevels`
--
ALTER TABLE `educatiolevels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `fiscalias`
--
ALTER TABLE `fiscalias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `personal`
--
ALTER TABLE `personal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT de la tabla `personal_status`
--
ALTER TABLE `personal_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `phones`
--
ALTER TABLE `phones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT de la tabla `phone_personal`
--
ALTER TABLE `phone_personal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `stablisments`
--
ALTER TABLE `stablisments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `status`
--
ALTER TABLE `status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `tribunales`
--
ALTER TABLE `tribunales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `type_documents`
--
ALTER TABLE `type_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `actuaciones_causas`
--
ALTER TABLE `actuaciones_causas`
  ADD CONSTRAINT `actuaciones_causas_ibfk_1` FOREIGN KEY (`causa`) REFERENCES `causas` (`id`),
  ADD CONSTRAINT `actuaciones_causas_ibfk_2` FOREIGN KEY (`actuacion`) REFERENCES `actuaciones` (`id`),
  ADD CONSTRAINT `quien reporta esa mmda` FOREIGN KEY (`how_report`) REFERENCES `personal` (`id`);

--
-- Filtros para la tabla `arrested`
--
ALTER TABLE `arrested`
  ADD CONSTRAINT `arrested_ibfk_1` FOREIGN KEY (`defended`) REFERENCES `defended` (`id`),
  ADD CONSTRAINT `arrested_ibfk_2` FOREIGN KEY (`stablisment`) REFERENCES `stablisments` (`id`);

--
-- Filtros para la tabla `causas`
--
ALTER TABLE `causas`
  ADD CONSTRAINT `causa_defensoria` FOREIGN KEY (`defensoria`) REFERENCES `defensorias` (`id`),
  ADD CONSTRAINT `causa_fiscalia` FOREIGN KEY (`fiscalia`) REFERENCES `fiscalias` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `causas_defendido_usuario`
--
ALTER TABLE `causas_defendido_usuario`
  ADD CONSTRAINT `causa` FOREIGN KEY (`causa`) REFERENCES `causas` (`id`),
  ADD CONSTRAINT `defendido` FOREIGN KEY (`defendido`) REFERENCES `defended` (`id`),
  ADD CONSTRAINT `usuario` FOREIGN KEY (`usuario`) REFERENCES `personal` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `causas_states`
--
ALTER TABLE `causas_states`
  ADD CONSTRAINT `causas_states_ibfk_1` FOREIGN KEY (`causa`) REFERENCES `causas` (`id`),
  ADD CONSTRAINT `causas_states_ibfk_2` FOREIGN KEY (`status`) REFERENCES `status` (`id`);

--
-- Filtros para la tabla `defended`
--
ALTER TABLE `defended`
  ADD CONSTRAINT `defended_ibfk_1` FOREIGN KEY (`typeDocument`) REFERENCES `type_documents` (`id`),
  ADD CONSTRAINT `defended_ibfk_2` FOREIGN KEY (`education`) REFERENCES `educatiolevels` (`id`);

--
-- Filtros para la tabla `defensorias_personal`
--
ALTER TABLE `defensorias_personal`
  ADD CONSTRAINT `defensoria` FOREIGN KEY (`defensoria`) REFERENCES `defensorias` (`id`),
  ADD CONSTRAINT `personal` FOREIGN KEY (`personal`) REFERENCES `personal` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `personal`
--
ALTER TABLE `personal`
  ADD CONSTRAINT `personal_ibfk_1` FOREIGN KEY (`typeDocument`) REFERENCES `type_documents` (`id`),
  ADD CONSTRAINT `personal_ibfk_2` FOREIGN KEY (`role`) REFERENCES `roles` (`id`);

--
-- Filtros para la tabla `phone_personal`
--
ALTER TABLE `phone_personal`
  ADD CONSTRAINT `phone_personal_ibfk_1` FOREIGN KEY (`personal`) REFERENCES `personal` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `phone_personal_ibfk_2` FOREIGN KEY (`phone`) REFERENCES `phones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
