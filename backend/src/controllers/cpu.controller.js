async function getInstanceByIP(ec2, ip) {
  const data = await ec2
    .describeInstances({
      Filters: [{ Name: "private-ip-address", Values: [ip] }],
    })
    .promise();

  const instance = data.Reservations?.[0]?.Instances?.[0];
  if (!instance) throw new Error("Instance not found");
  return instance;
}

async function getCpu(req, res) {
  const { ip, startTime, endTime, period } = req.body;
  const { ec2, cloudwatch } = req.app.locals;

  try {
    const instance = await getInstanceByIP(ec2, ip);

    if (instance.State?.Name === "terminated") {
      return res.status(400).json({ error: "Instance is terminated" });
    }

    const metrics = await cloudwatch
      .getMetricStatistics({
        StartTime: new Date(startTime),
        EndTime: new Date(endTime),
        MetricName: "CPUUtilization",
        Namespace: "AWS/EC2",
        Period: parseInt(period, 10),
        Statistics: ["Average"],
        Dimensions: [{ Name: "InstanceId", Value: instance.InstanceId }],
      })
      .promise();

    const sorted = (metrics.Datapoints || []).sort(
      (a, b) => new Date(a.Timestamp) - new Date(b.Timestamp),
    );

    res.json({
      instanceId: instance.InstanceId,
      state: instance.State?.Name,
      cpuData: sorted,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getCpu };
