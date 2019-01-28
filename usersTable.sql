CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(45) NOT NULL,
  `hash` varchar(60) NOT NULL,
  `userRole` int(11) DEFAULT '0',
  `accountLocked` int(11) DEFAULT '1',
  `refreshTokenLifetime` int(11) DEFAULT '14400',
  `joinedDate` bigint(20) DEFAULT '0',
  `currentLoginTime` bigint(20) DEFAULT NULL,
  `currentLoginIp` varchar(16) DEFAULT NULL,
  `emailVerified` int(11) DEFAULT NULL,
  `emailSignupToken` varchar(45) DEFAULT NULL,
  `emailSignupTokenExpires` bigint(20) DEFAULT NULL,
  `companies_idcompany` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
