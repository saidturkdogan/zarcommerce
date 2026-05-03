# Build stage
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /build
COPY logging-common/pom.xml logging-common/pom.xml
COPY logging-common/src logging-common/src
RUN mvn -q -f logging-common/pom.xml install -DskipTests
COPY api-gateway/pom.xml api-gateway/pom.xml
COPY api-gateway/src api-gateway/src
RUN mvn -q -f api-gateway/pom.xml clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /build/api-gateway/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
