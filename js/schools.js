// Function to check if deadline is posted
function hasPostedDeadline(school) {
  return school.deadline !== null && school.deadline !== undefined;
}

// Function to calculate time from now to deadline
function getTimeUntilDeadline(deadlineDate, school) {
  // If deadline equals startDate, there's no posted deadline
  if (!hasPostedDeadline(school)) {
    return null;
  }

  const now = new Date();
  const deadline = new Date(deadlineDate);
  const diffTime = deadline - now;

  if (diffTime < 0) {
    return "Deadline passed";
  }

  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today!";
  } else if (diffDays === 1) {
    return "1 day";
  } else if (diffDays < 30) {
    return `${diffDays} days`;
  } else if (diffDays < 60) {
    return "~1 month";
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `~${months} months`;
  } else {
    const years = Math.floor(diffDays / 365);
    return years === 1 ? "~1 year" : `~${years} years`;
  }
}

// Function to determine school status
function getSchoolStatus(school) {
  const now = new Date();
  const startDate = new Date(school.startDate);
  const endDate = new Date(school.endDate);

  // Check if deadline is posted
  if (!hasPostedDeadline(school)) {
    // For schools without posted deadlines
    if (startDate <= now) {
      return "finished"; // School has started or finished
    }
    return "no-deadline"; // School hasn't started yet
  }

  const deadline = new Date(school.deadline);

  if (startDate <= now) {
    return "finished"; // School is in progress or has ended
  } else if (deadline < now) {
    return "deadline-passed"; // Deadline passed but school hasn't started
  } else {
    return "active"; // Deadline hasn't passed yet
  }
}

// Function to format date range
function formatDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const options = { month: "short", day: "numeric", year: "numeric" };
  const startStr = start.toLocaleDateString("en-US", options);
  const endStr = end.toLocaleDateString("en-US", options);

  return `${startStr} - ${endStr}`;
}

// Function to format deadline
function formatDeadline(deadline, school) {
  if (!hasPostedDeadline(school)) {
    return "No deadline posted";
  }
  const date = new Date(deadline);
  const options = { month: "short", day: "numeric", year: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

// Function to check if school was added recently (within last 7 days)
function isRecentlyAdded(dateAdded) {
  if (!dateAdded) return false;

  const now = new Date();
  const added = new Date(dateAdded);
  const diffTime = now - added;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return diffDays <= 7;
}

// Load and display schools
async function loadSchools() {
  try {
    const basePath = window.location.pathname.includes("/pages/")
      ? "../"
      : "./";
    const response = await fetch(`${basePath}data/schools.json`);
    const schools = await response.json();

    const tbody = document.getElementById("schools-tbody");

    if (schools.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" class="no-data">No schools data available yet.</td></tr>';
      return;
    }

    const now = new Date();

    // Separate schools by status
    const activeDeadlines = [];
    const noDeadlines = [];
    const finishedSchools = [];

    schools.forEach((s) => {
      const startDate = new Date(s.startDate);

      // If school has started, it's finished regardless of deadline
      if (startDate <= now) {
        finishedSchools.push(s);
      } else if (hasPostedDeadline(s)) {
        const deadline = new Date(s.deadline);
        if (deadline >= now) {
          activeDeadlines.push(s);
        } else {
          finishedSchools.push(s);
        }
      } else {
        // No posted deadline and hasn't started yet
        noDeadlines.push(s);
      }
    });

    // Sort active deadlines: earliest deadline first
    activeDeadlines.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    // Sort no deadlines: earliest start date first
    noDeadlines.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    // Sort finished schools: future start dates first
    finishedSchools.sort(
      (a, b) => new Date(b.startDate) - new Date(a.startDate)
    );

    // Combine: active first, then no deadline, then finished
    const sortedSchools = [
      ...activeDeadlines,
      ...noDeadlines,
      ...finishedSchools,
    ];

    tbody.innerHTML = sortedSchools
      .map((school) => {
        const timeUntil = getTimeUntilDeadline(school.deadline, school);
        const status = getSchoolStatus(school);
        const isNew = isRecentlyAdded(school.dateAdded);

        let rowClass = "";
        let deadlineClass = "";
        let deadlineText = "";

        if (status === "finished") {
          rowClass = "school-finished";
          deadlineClass = "deadline-finished";
          deadlineText = timeUntil || "—";
        } else if (status === "no-deadline") {
          rowClass = "school-no-deadline";
          deadlineClass = "deadline-none";
          deadlineText = "—";
        } else if (status === "deadline-passed") {
          rowClass = "school-deadline-passed";
          deadlineClass = "deadline-passed-text";
          deadlineText = timeUntil || "—";
        } else {
          rowClass = "school-active";
          deadlineClass = "deadline-active";
          deadlineText = timeUntil || "—";
        }

        const newBadge = isNew ? '<span class="new-badge">NEW</span>' : "";

        return `
                <tr class="${rowClass}">
                    <td>
                        <a href="${
                          school.url
                        }" target="_blank" rel="noopener noreferrer">${
          school.name
        }</a>
                        ${newBadge}
                    </td>
                    <td>${school.place}</td>
                    <td>${formatDateRange(
                      school.startDate,
                      school.endDate
                    )}</td>
                    <td>${formatDeadline(school.deadline, school)}</td>
                    <td class="${deadlineClass}">${deadlineText}</td>
                </tr>
            `;
      })
      .join("");
  } catch (error) {
    console.error("Error loading schools:", error);
    document.getElementById("schools-tbody").innerHTML =
      '<tr><td colspan="5" class="error">Error loading schools data. Please try again later.</td></tr>';
  }
}

// Load schools when page is ready
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(loadSchools, 200); // Small delay to ensure page is fully loaded
});
