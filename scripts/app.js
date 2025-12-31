const wfnamebtn = document.querySelector(".wfnamebtn")
const wfname = document.querySelector(".wfname")
const tfblock = document.querySelector(".tfblock")
const wft = document.querySelector(".wft")
const wfAddBlock = document.querySelector(".wfAddBlock")


let activeWorkflowFilter = "progress";

const optSlider = document.querySelector(".optSlider");

optSlider.addEventListener("click", (e) => {
    const opt = e.target.closest(".opt");
    if (!opt) return;

    // update UI
    optSlider.querySelectorAll(".opt").forEach(o => o.classList.remove("sel"));
    opt.classList.add("sel");

    // update filter
    activeWorkflowFilter = opt.dataset.filter;

    // re-render workflows
    renderHome();
});


let workflowSearchQuery = "";
const searchInput = document.querySelector(".sInput input");

searchInput.addEventListener("input", (e) => {
    workflowSearchQuery = e.target.value.toLowerCase();
    renderHome();
});



wfnamebtn.onclick = function(){
    const wfnameminlen = 3
    const wfnamemaxlen = 30
    const wfnameval = wfname.value
    if(!wfnameval.trim()){
        wfname.value=""
        alert("Please enter a valid name")
    }else if((wfnameval.trim()).length>wfnamemaxlen){
        wfname.value=""
        alert("Name too long")
    }else if((wfnameval.trim().length<wfnameminlen)){
        alert("Name too short")
    }
    else{
        wft.innerText = wfnameval
        tfblock.style.display="none"
        wfAddBlock.style.display="block"

        setTimeout(() => {
            const firstMstInput = wfAddBlock.querySelector(".mst_title input");
            if (firstMstInput) firstMstInput.focus();
        }, 0);
    }
}





//////////////////////////////////////////////



function subtemp(t){
    return `
<div class="subt">
            <div class="subt_title">
                                    <div class="tchkbox">
                                        <i class="fa-light fa-square"></i> ${t}. 
                                    </div>
                                    <div class="titleinput">
                                        <input spellcheck="false" type="text" placeholder="Subtask name">
                                    </div>
                                </div>
                            </div>
`
}

const addsubtbtn = document.querySelector(".addsubtbtn")


/* ---------- HELPERS ---------- */

function getLastInput(container, selector) {
    const inputs = container.querySelectorAll(selector);
    return inputs[inputs.length - 1];
}

function isEmptyInput(input) {
    return !input || !input.value.trim();
}


/* ---------- SUBTASK TEMPLATE ---------- */

function createSubtask(number) {
    const div = document.createElement("div");
    div.className = "subt";
    div.innerHTML = `
        <div class="subt_title">
            <div class="tchkbox">
                <i class="fa-light fa-square"></i> ${number}. 
            </div>
            <div class="titleinput">
                <input spellcheck="false" type="text" placeholder="Subtask name">
            </div>
        </div>
    `;
    return div;
}

/* ---------- MILESTONE TEMPLATE ---------- */

function createMilestone(number) {
    const div = document.createElement("div");
    div.className = "mst";
    div.innerHTML = `
        <div class="mst_title">
            <div class="tchkbox">
                <i class="fa-light fa-square"></i> ${number}. 
            </div>
            <div class="titleinput">
                <input spellcheck="false" type="text" placeholder="Milestone name">
            </div>
        </div>

        <div class="subtwhole">
            <div class="sdummywrap"></div>

            <div class="addsubtbtn">
                <button><i class="fa-light fa-plus"></i> add new subtask</button>
            </div>
        </div>
    `;
    return div;
}

/* ---------- ADD SUBTASK ---------- */

document.addEventListener("click", function (e) {
    if (!e.target.closest(".addsubtbtn")) return;

    const btn = e.target.closest(".addsubtbtn");
    const mst = btn.closest(".mst");
    const subtWrap = mst.querySelector(".sdummywrap");

    const subtasks = subtWrap.querySelectorAll(".subt");

    // ✅ Allow first subtask always
    if (subtasks.length > 0) {
        const lastInput = subtasks[subtasks.length - 1].querySelector("input");

        if (!lastInput.value.trim()) {
            alert("Please fill the previous subtask first");
            return;
        }
    }

    const count = subtasks.length + 1;
    const newSubtask = createSubtask(count);
    subtWrap.appendChild(newSubtask);
    
    // auto-focus new subtask input
    setTimeout(() => {
        newSubtask.querySelector("input")?.focus();
    }, 0);
    
});


/* ---------- ADD MILESTONE ---------- */

const addMstBtn = document.querySelector(".addmstbtn button");
const mswhole = document.querySelector(".mswhole");

addMstBtn.onclick = function () {
    const milestones = mswhole.querySelectorAll(".mst");
    const lastMilestone = milestones[milestones.length - 1];

    const lastTitleInput = lastMilestone.querySelector(".mst_title input");

    if (!lastTitleInput.value.trim()) {
        alert("Please fill the previous milestone title");
        return;
    }

    const count = milestones.length + 1;
    const newMilestone = createMilestone(count);
    mswhole.insertBefore(newMilestone, document.querySelector(".addmstbtn"));
    
    // auto-focus new milestone title
    setTimeout(() => {
        newMilestone.querySelector(".mst_title input")?.focus();
    }, 0);
    
};


/* ---------- CREATE WORKFLOW JSON ---------- */

const createBtn = document.querySelector(".crtbtnwrap button");

// const createBtn = document.querySelector(".crtbtnwrap button");

createBtn.onclick = function () {
    const milestonesEls = document.querySelectorAll(".wfAddBlock .mst");

    if (milestonesEls.length === 0) {
        alert("Please add at least one milestone");
        return;
    }

    const workflow = {
        id: Date.now(),
        name: wft.innerText,
        followOrder: true,
        milestones: []
    };

    for (let mst of milestonesEls) {
        const mstInput = mst.querySelector(".mst_title input");

        if (!mstInput.value.trim()) {
            alert("Please fill all milestone titles before creating");
            return;
        }

        const milestone = {
            title: mstInput.value.trim(),
            completed: false,
            subtasks: []
        };

        const subInputs = mst.querySelectorAll(".subt input");

        for (let sub of subInputs) {
            if (!sub.value.trim()) {
                alert("Please fill all subtask titles before creating");
                return;
            }

            milestone.subtasks.push({
                title: sub.value.trim(),
                completed: false
            });
        }

        workflow.milestones.push(milestone);
    }

    // ✅ SAVE
    const stored = localStorage.getItem("workflows");
    const data = stored ? JSON.parse(stored) : { workflows: [] };
    data.workflows.push(workflow);
    localStorage.setItem("workflows", JSON.stringify(data));

    console.log("Saved to localStorage:", data);

    // ✅ CLOSE CREATE VIEW
    addNewContainer.classList.add("silent");
    homeLayout.classList.remove("silent");

    // ✅ RESET FORM
    resetCreateView();
    setWorkflowFilter("progress");

    // ✅ REFRESH HOME
    renderHome();
};


function loadWorkflows() {
    const data = localStorage.getItem("workflows");
    return data ? JSON.parse(data).workflows : [];
}

function saveWorkflows(workflows) {
    localStorage.setItem("workflows", JSON.stringify({ workflows }));
}

function getWorkflowMeta(workflow) {
    const totalMilestones = workflow.milestones.length;
    let completedMilestones = 0;
    let totalSubtasks = 0;
    let completedSubtasks = 0;

    workflow.milestones.forEach(ms => {
        const subCount = ms.subtasks.length;
        const subCompleted = ms.subtasks.filter(st => st.completed).length;

        // count milestones with subtasks
        totalSubtasks += subCount;
        completedSubtasks += subCompleted;

        // mark milestone completion dynamically if it has subtasks
        if (subCount > 0) {
            ms.completed = subCompleted === subCount;
        }
        // milestones with no subtasks keep their manual completed state

        // count completed milestones for UI
        if (ms.completed) completedMilestones++;

        // special case: empty milestones contribute 1 to totalSubtasks for percentage
        if (subCount === 0) {
            totalSubtasks += 1;
            if (ms.completed) completedSubtasks += 1;
        }
    });

    const percent = totalSubtasks === 0 ? 0 : Math.round((completedSubtasks / totalSubtasks) * 100);

    return {
        total: totalMilestones,
        completed: completedMilestones,
        percent
    };
}





const homeLayout = document.querySelector(".homeLayout");
const indexes = homeLayout.querySelector(".indexes");

function renderHome() {
    indexes.innerHTML = "";

    const workflows = loadWorkflows();

    workflows.forEach(wf => {
        const meta = getWorkflowMeta(wf);

        if (
            workflowSearchQuery &&
            !wf.name.toLowerCase().includes(workflowSearchQuery)
        ) {
            return;
        }
    

        const isCompleted = meta.completed === meta.total;

        // 🔥 FILTER LOGIC
        if (activeWorkflowFilter === "progress" && isCompleted) return;
        if (activeWorkflowFilter === "completed" && !isCompleted) return;

        const div = document.createElement("div");
        div.className = "wflow";
        div.innerHTML = `
            <div class="wtop">
                <div class="wtitle">${wf.name}</div>
                <div class="wmst">${meta.completed}/${meta.total}</div>
            </div>
            <div class="wprog">
                <div class="pbar">
                    <div class="slider" style="width:${meta.percent}%"></div>
                </div>
            </div>
        `;

        div.onclick = () => openWorkflow(wf.id);
        indexes.appendChild(div);
    });
}


const wfView = document.querySelector(".wfView");
const wfViewTitle = wfView.querySelector(".wfvT");
const wfViewMsWrap = wfView.querySelector(".mswhole");
const wfViewProg = wfView.querySelector(".indic");
const wfViewCurr = wfView.querySelector(".currprog");

let activeWorkflow = null;


function openWorkflow(id) {
    const workflows = loadWorkflows();
    activeWorkflow = workflows.find(w => w.id === id);

    if (!activeWorkflow) return;

    homeLayout.classList.add("silent");
    wfView.classList.remove("silent");

    renderWorkflowView();
}


function renderWorkflowView() {
    wfViewTitle.innerText = activeWorkflow.name;
    wfViewMsWrap.innerHTML = "";

    const meta = getWorkflowMeta(activeWorkflow);
    wfViewCurr.innerText = `${meta.completed}/${meta.total}`;
    wfViewProg.innerText = `${meta.percent}% completed`;
    wfView.querySelector(".slider").style.width = `${meta.percent}%`;

    activeWorkflow.milestones.forEach((ms, mi) => {
        const msDiv = document.createElement("div");
        msDiv.className = "msx viewmst";
        msDiv.innerHTML = `
        <div class="msv_title">
            <div class="tchkbox mstchk">
                <i class=" ${ms.completed ? "fa-solid fa-check-square" : "fa-light fa-square"}"></i>
                <span class="itno"> ${mi + 1}.</span>
            </div>
            <div class="titledisp">
                <p>${ms.title}</p>
            </div>
        </div>
        <div class="subtwhole">
            <div class="sdummywrap"></div>
        </div>
    `;
    

    const mstCheckbox = msDiv.querySelector(".mstchk");

if (ms.subtasks.length === 0) {
    mstCheckbox.classList.add("clickable");

    mstCheckbox.onclick = () => {
        if (activeWorkflow.followOrder) {
            // check if previous milestones are completed
            const mstIndex = activeWorkflow.milestones.indexOf(ms);
            if (mstIndex > 0 && !activeWorkflow.milestones[mstIndex - 1].completed) {
                alert("Please complete the previous milestone first.");
                return;
            }
        }
    
        ms.completed = !ms.completed;
    
        // persist
        const workflows = loadWorkflows();
        const idx = workflows.findIndex(w => w.id === activeWorkflow.id);
        workflows[idx] = activeWorkflow;
        saveWorkflows(workflows);
    
        renderWorkflowView();
    };
    
}

        const subWrap = msDiv.querySelector(".sdummywrap");

        ms.subtasks.forEach(sub => {
            const subDiv = document.createElement("div");
            subDiv.className = "subt viewsubt";

            subDiv.innerHTML = `
                <div class="subt_title">
                    <div class="tchkbox wftch">
                        <i class=" ${sub.completed ? "fa-solid fa-check-square" : "fa-light fa-square"}"></i>
                    </div>
                    <div class="subtitledisp">
                        <p>${sub.title}</p>
                    </div>
                </div>
            `;

            subDiv.onclick = () => toggleSubtask(sub, ms);
            subWrap.appendChild(subDiv);
        });

        wfViewMsWrap.appendChild(msDiv);
    });
}

function toggleSubtask(subtask, milestone) {
    const isChecking = !subtask.completed;

    if (isChecking && activeWorkflow.followOrder) {

        const mstIndex = activeWorkflow.milestones.indexOf(milestone);

        // 🔒 RULE 1: previous milestone must be fully completed
        if (mstIndex > 0) {
            const prevMilestone = activeWorkflow.milestones[mstIndex - 1];

            // If previous milestone has subtasks, check all are completed
            // If empty, check if it is manually completed
            const prevDone = prevMilestone.subtasks.length > 0 
                ? prevMilestone.subtasks.every(s => s.completed)
                : prevMilestone.completed;

            if (!prevDone) {
                alert("Please complete the previous milestone first.");
                return;
            }
        }

        // 🔒 RULE 2: previous subtask in same milestone
        const subIndex = milestone.subtasks.indexOf(subtask);
        if (subIndex > 0 && !milestone.subtasks[subIndex - 1].completed) {
            alert("Please complete the previous subtask first.");
            return;
        }
    }

    // ✅ TOGGLE
    subtask.completed = !subtask.completed;

    // update milestone completion
    milestone.completed = milestone.subtasks.every(s => s.completed);

    saveWorkflowChanges();
    renderWorkflowView();
}

function saveWorkflowChanges() {
    const workflows = loadWorkflows();
    const idx = workflows.findIndex(w => w.id === activeWorkflow.id);
    if (idx !== -1) {
        workflows[idx] = activeWorkflow;
        saveWorkflows(workflows);
    }
}



wfView.querySelector(".bck").onclick = () => {
    wfView.classList.add("silent");
    homeLayout.classList.remove("silent");
    renderHome();
};

document.addEventListener("DOMContentLoaded", () => {
    renderHome();
});


const createNewBtn = document.querySelector(".cn");
const addNewContainer = document.querySelector(".addNewContainer");

createNewBtn.onclick = () => {
    homeLayout.classList.add("silent");
    wfView.classList.add("silent");
    addNewContainer.classList.remove("silent");

    setTimeout(() => {
        wfname.focus();
    }, 0);
    
};
const closeCreateBtn = document.querySelector(".closer");

closeCreateBtn.onclick = () => {
    addNewContainer.classList.add("silent");
    homeLayout.classList.remove("silent");
};

function resetCreateView() {
    // reset workflow name input and display
    wfname.value = "";
    wft.innerText = "";

    // show first step again (enter workflow name)
    tfblock.style.display = "flex";
    wfAddBlock.style.display = "none";

    const mswhole = document.querySelector(".wfContainer .mswhole");

    // keep only the first milestone
    const firstMst = mswhole.querySelector(".mst");
    mswhole.querySelectorAll(".mst:not(:first-child)").forEach(m => m.remove());

    // reset first milestone
    firstMst.querySelector(".mst_title input").value = "";
    firstMst.querySelector(".sdummywrap").innerHTML = "";
    firstMst.querySelector(".tchkbox").innerHTML = `<i class="fa-light fa-square"></i> 1.`;

    // ensure Add Milestone button exists
    const addBtn = mswhole.querySelector(".addmstbtn");
    if (!addBtn) {
        const btnDiv = document.createElement("div");
        btnDiv.className = "addmstbtn";
        btnDiv.innerHTML = `<button><i class="fa-light fa-plus"></i> add new milestone</button>`;
        mswhole.appendChild(btnDiv);
    }
}
const wfCloseBtn = document.querySelector(".wf-close-btn");
wfCloseBtn.onclick = () => {
    if (!confirm("Discard this workflow? All changes will be lost.")) return;

    addNewContainer.classList.add("silent");
    homeLayout.classList.remove("silent");
    resetCreateView();
};
const wfMoreBtn = document.querySelector(".wf-more");
const wfMenu = document.querySelector(".wf-menu");

wfMoreBtn.onclick = (e) => {
    e.stopPropagation();
    wfMenu.classList.toggle("silent");
};
document.addEventListener("click", () => {
    wfMenu.classList.add("silent");
});
const deleteBtn = document.querySelector(".wf-delete");

deleteBtn.onclick = () => {
    const ok = confirm(
        `Delete workflow "${activeWorkflow.name}"?\nThis action cannot be undone.`
    );

    if (!ok) return;

    const workflows = loadWorkflows().filter(
        w => w.id !== activeWorkflow.id
    );

    saveWorkflows(workflows);

    // reset state
    activeWorkflow = null;
    wfMenu.classList.add("silent");
    wfView.classList.add("silent");
    homeLayout.classList.remove("silent");


    renderHome();
};
function setWorkflowFilter(filter) {
    activeWorkflowFilter = filter;

    const optSlider = document.querySelector(".optSlider");
    optSlider.querySelectorAll(".opt").forEach(opt => {
        opt.classList.toggle(
            "sel",
            opt.dataset.filter === filter
        );
    });
    console.log("Filter set to:", filter);
}
