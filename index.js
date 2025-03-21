import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";
import chalk from "chalk";
import boxen from "boxen";
import { execSync } from "child_process";

const path = "./data.json";
const git = simpleGit();

// Tahun target
const year = 2023;
const commitsPerDay = 5;

const displayUI = (message, type = "info") => {
  const colors = {
    info: "blue",
    success: "green",
    warning: "yellow",
    error: "red",
  };
  
  console.log(chalk[colors[type]](message));
};

// Fungsi untuk memastikan commit dengan tanggal tertentu
const makeCommitWithExactDate = async (date, index) => {
  try {
    // Format tanggal untuk Git
    const formattedDate = date.format("YYYY-MM-DD HH:mm:ss");
    
    // Perbarui data.json
    const data = {
      date: formattedDate,
      index: index,
      message: `Commit for ${formattedDate}`,
    };
    
    await jsonfile.writeFileSync(path, data);
    
    // Gunakan execSync untuk memastikan environment variable GIT_COMMITTER_DATE
    execSync(`git add ${path} && GIT_COMMITTER_DATE="${formattedDate}" GIT_AUTHOR_DATE="${formattedDate}" git commit -m "Commit ${index} for ${formattedDate}" --date "${formattedDate}"`, {
      stdio: 'inherit'
    });
    
    displayUI(`✓ Created commit for ${formattedDate}`, "success");
    return true;
  } catch (error) {
    displayUI(`Error creating commit: ${error.message}`, "error");
    return false;
  }
};

const fillYear = async () => {
  displayUI(`Starting to fill ${year} with commits...`, "info");
  
  // Iterasi untuk setiap hari dalam tahun
  const startDate = moment(`${year}-01-01`);
  const endDate = moment(`${year}-12-31`);
  let currentDate = startDate.clone();
  let commitCount = 0;
  
  while (currentDate <= endDate) {
    displayUI(`Processing day: ${currentDate.format("YYYY-MM-DD")}`, "info");
    
    // Buat beberapa commit untuk hari ini
    for (let i = 1; i <= commitsPerDay; i++) {
      // Acak jam dan menit
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);
      
      const commitDate = currentDate.clone().hour(hour).minute(minute);
      await makeCommitWithExactDate(commitDate, ++commitCount);
      
      // Sedikit jeda antara commit
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Push setiap 7 hari untuk memastikan
    if (currentDate.day() === 0) {
      try {
        displayUI("Pushing commits to GitHub...", "info");
        await git.push('origin', 'main', ['--force']);
        displayUI("Commits pushed successfully!", "success");
      } catch (error) {
        displayUI(`Error pushing commits: ${error.message}`, "error");
      }
    }
    
    // Pindah ke hari berikutnya
    currentDate.add(1, 'day');
  }
  
  // Final push
  try {
    displayUI("Pushing final commits to GitHub...", "info");
    await git.push('origin', 'main', ['--force']);
    displayUI(`All commits for ${year} have been pushed!`, "success");
  } catch (error) {
    displayUI(`Error in final push: ${error.message}`, "error");
  }
};

// Mulai proses
fillYear();
