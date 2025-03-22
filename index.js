import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";
import chalk from "chalk";
import boxen from "boxen";

const path = "./data.json";
const git = simpleGit();

// Fokus ke tahun 2024 saja
const startDate = moment("2023-01-01");
const endDate = moment("2025-03-22");
const minCommitsPerDay = 10; // Minimal commit per hari

const displayUI = (message, type = "info") => {
  const colors = {
    info: "blue",
    success: "green",
    warning: "yellow",
    error: "red",
  };
  const boxenOptions = {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: colors[type],
    backgroundColor: "#555555",
  };
  
  console.log(boxen(chalk[colors[type]](message), boxenOptions));
};

const makeCommit = async (date, commitNumber) => {
  const formattedDate = date.format("YYYY-MM-DDTHH:mm:ss");
  
  const data = {
    date: formattedDate,
    commit: {
      message: `Commit #${commitNumber} on ${formattedDate}`,
      author: "danysetiyawan50@gmail.com",
      branch: "main",
    },
  };
  
  await jsonfile.writeFile(path, data);
  await git.add([path]);
  await git.commit(`Commit #${commitNumber} on ${formattedDate}`, { "--date": formattedDate });
  return formattedDate;
};

const makeCommitsForDay = async (date, day) => {
  const commitsToday = minCommitsPerDay;
  displayUI(`📅 Day ${day}: Creating ${commitsToday} commits for ${date.format("YYYY-MM-DD")}`, "info");
  
  for (let j = 1; j <= commitsToday; j++) {
    // Acak jam dan menit
    const hours = Math.floor(Math.random() * 24);
    const minutes = Math.floor(Math.random() * 60);
    
    const commitDate = date.clone().hour(hours).minute(minutes);
    const formattedDate = await makeCommit(commitDate, j);
    
    displayUI(`✅ Created commit ${j}/${commitsToday} for ${date.format("YYYY-MM-DD")} at ${formattedDate}`, "success");
  }
};

const fillAllDays = async () => {
  try {
    let currentDate = moment(startDate);
    let day = 1;
    
    // Iterate through each day of 2024
    while (currentDate <= endDate) {
      await makeCommitsForDay(currentDate, day);
      currentDate = moment(currentDate).add(1, "days");
      day++;
      
      // Push setiap 7 hari untuk menghindari terlalu banyak commit sebelum push
      if (day % 7 === 0) {
        displayUI("🔄 Pushing commits to GitHub...", "info");
        await git.push();
        displayUI("✅ Commits pushed successfully!", "success");
      }
    }
    
    // Final push untuk sisa commit
    displayUI("🔄 Pushing final commits to GitHub...", "info");
    await git.push();
    displayUI("🎉 All commits have been pushed to GitHub! Your contribution graph should be full green soon.", "success");
  } catch (error) {
    displayUI(`❌ Error: ${error.message}`, "error");
  }
};

// Tampilkan UI Awal
displayUI(
  "🚀 Starting the full green GitHub contribution process for 2024...\n" +
    chalk.yellow("Total days to fill: " + moment(endDate).diff(startDate, 'days') + 1),
  "info"
);

// Jalankan proses
fillAllDays();
