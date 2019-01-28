CREATE TABLE `refresh_tokens` (
  `token` varchar(60) NOT NULL,
  `userID` int(11) NOT NULL,
  `clientID` varchar(45) NOT NULL,
  `creationTimestamp` bigint(20) NOT NULL,
  `expiresTimestamp` bigint(20) NOT NULL,
  PRIMARY KEY (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
